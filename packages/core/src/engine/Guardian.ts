import { DEFAULT_RISK_LEVELS } from '../constants/defaults.js';
import { runHooks } from '../hooks/runHooks.js';
import { RiskEngine, type RiskEngineDependencies } from './RiskEngine.js';
import { ReportBuilder } from '../report/Report.js';
import { RuleBuilder } from '../rules/RuleBuilder.js';
import { RuleEvaluator } from '../rules/RuleEvaluator.js';
import { ScoreCalculator } from '../score/ScoreCalculator.js';
import { SignalStore } from '../signals/SignalStore.js';
import { PluginRegistry } from '../plugins/PluginRegistry.js';
import type { Plugin } from '../plugins/Plugin.js';
import type { CreateRuleInput, RuleGroupInput } from '../types/rules.js';
import type {
  AfterAnalyzeContext,
  AfterAnalyzeHook,
  AnalyzeContext,
  BeforeAnalyzeHook,
} from '../types/hooks.js';
import type { GuardianConfig, RiskReport, RiskLevelThreshold } from '../types/report.js';
import type { SignalValue } from '../types/signals.js';
import { validateRiskLevels, validateRuleGroupInput } from '../utils/validation.js';

/**
 * Fluent public API for risk analysis.
 * Collects signals and rules, then produces an immutable report.
 *
 * For concurrent workloads (e.g. HTTP), configure one template instance
 * and call {@link fork} per request.
 */
export class Guardian {
  private readonly signalStore: SignalStore;
  private readonly riskEngine: RiskEngine;
  private readonly pluginRegistry = new PluginRegistry();
  private readonly plugins: Plugin[] = [];
  private readonly beforeHooks: BeforeAnalyzeHook[] = [];
  private readonly afterHooks: AfterAnalyzeHook[] = [];
  private readonly thresholds: readonly RiskLevelThreshold[];
  private analyzing = false;

  constructor(config: GuardianConfig = {}) {
    this.thresholds =
      config.levels !== undefined ? [...config.levels] : DEFAULT_RISK_LEVELS;
    if (config.levels !== undefined) {
      validateRiskLevels(config.levels);
    }
    this.signalStore = new SignalStore();

    const deps: RiskEngineDependencies = {
      signalStore: this.signalStore,
      ruleEvaluator: new RuleEvaluator(),
      scoreCalculator: new ScoreCalculator(),
      reportBuilder: new ReportBuilder(),
    };

    this.riskEngine = new RiskEngine(deps, this.thresholds);
  }

  /**
   * Add a signal value for risk evaluation.
   */
  signal(key: string, value: SignalValue): this {
    this.signalStore.set(key, value);
    return this;
  }

  /**
   * Read a signal value without modifying state.
   */
  getSignal(key: string): SignalValue | undefined {
    return this.signalStore.get(key);
  }

  /**
   * Register a rule. ID is auto-generated.
   */
  rule(input: CreateRuleInput): this {
    this.assertNotAnalyzing('register rules');
    const rule = RuleBuilder.create(input);
    this.riskEngine.addRule(rule);
    return this;
  }

  /**
   * Register a named group of rules with an optional combined score cap.
   */
  ruleGroup(input: RuleGroupInput): this {
    this.assertNotAnalyzing('register rule groups');
    validateRuleGroupInput(input as RuleGroupInput);

    for (const ruleInput of input.rules) {
      this.rule({ ...ruleInput, group: input.name });
    }

    if (input.maxScore !== undefined) {
      this.riskEngine.setGroupCap(input.name, input.maxScore);
    }

    return this;
  }

  /**
   * Install a plugin. Each plugin name may only be registered once.
   */
  use(plugin: Plugin): this {
    this.assertNotAnalyzing('install plugins');
    this.plugins.push(plugin);
    this.pluginRegistry.install(plugin, this);
    return this;
  }

  /**
   * Register a hook that runs before rule evaluation.
   * Use for loading signals from requests, Redis, IP lookups, etc.
   */
  beforeAnalyze<TContext = unknown>(hook: BeforeAnalyzeHook<TContext>): this {
    this.beforeHooks.push(hook as BeforeAnalyzeHook);
    return this;
  }

  /**
   * Register a hook that runs after the report is built.
   * Use for audit logging, metrics, or blocking responses.
   */
  afterAnalyze<TContext = unknown>(hook: AfterAnalyzeHook<TContext>): this {
    this.afterHooks.push(hook as AfterAnalyzeHook);
    return this;
  }

  /**
   * Returns names of installed plugins.
   */
  getInstalledPlugins(): readonly string[] {
    return this.pluginRegistry.getInstalled();
  }

  /**
   * Run risk analysis synchronously (skips lifecycle hooks).
   * Prefer {@link analyzeAsync} when hooks are registered.
   */
  analyze(): RiskReport {
    if (this.beforeHooks.length > 0 || this.afterHooks.length > 0) {
      throw new Error(
        'Guardian has analyze hooks registered. Use analyzeAsync() instead of analyze().',
      );
    }
    return this.riskEngine.analyze();
  }

  /**
   * Run lifecycle hooks, evaluate rules, and return an immutable report.
   *
   * @param context Optional caller context passed to hooks (e.g. Express `req`).
   */
  async analyzeAsync<TContext = unknown>(context?: TContext): Promise<RiskReport> {
    this.analyzing = true;
    try {
      const analyzeContext: AnalyzeContext<TContext> = {
        data: context as TContext,
        guardian: this,
      };

      await runHooks(this.beforeHooks, analyzeContext);

      const report = this.riskEngine.analyze();

      const afterContext: AfterAnalyzeContext<TContext> = {
        ...analyzeContext,
        report,
      };

      await runHooks(this.afterHooks, afterContext);

      return report;
    } finally {
      this.analyzing = false;
    }
  }

  /**
   * Create an isolated copy sharing rules, plugins, and hooks.
   * Each fork has its own signal store for safe concurrent use.
   */
  fork(): Guardian {
    const child = new Guardian({ levels: [...this.thresholds] });

    for (const rule of this.riskEngine.getRules()) {
      child.riskEngine.addRule(rule);
    }

    for (const cap of this.riskEngine.getGroupCaps()) {
      child.riskEngine.setGroupCap(cap.name, cap.maxScore);
    }

    child.plugins.push(...this.plugins);
    child.pluginRegistry.adoptInstalled(this.pluginRegistry.getInstalled());

    for (const hook of this.beforeHooks) {
      child.beforeHooks.push(hook);
    }

    for (const hook of this.afterHooks) {
      child.afterHooks.push(hook);
    }

    return child;
  }

  /**
   * Clear all signals. Rules, plugins, and hooks persist across resets.
   */
  reset(): this {
    this.signalStore.clear();
    return this;
  }

  private assertNotAnalyzing(action: string): void {
    if (this.analyzing) {
      throw new Error(`Cannot ${action} while analysis is in progress`);
    }
  }
}
