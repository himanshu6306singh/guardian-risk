import { DEFAULT_RISK_LEVELS } from '../constants/defaults.js';
import { RiskEngine, type RiskEngineDependencies } from './RiskEngine.js';
import { ReportBuilder } from '../report/Report.js';
import { RuleBuilder } from '../rules/RuleBuilder.js';
import { RuleEvaluator } from '../rules/RuleEvaluator.js';
import { ScoreCalculator } from '../score/ScoreCalculator.js';
import { SignalStore } from '../signals/SignalStore.js';
import type { CreateRuleInput } from '../types/rules.js';
import type { GuardianConfig, RiskReport } from '../types/report.js';
import type { SignalValue } from '../types/signals.js';

/**
 * Fluent public API for risk analysis.
 * Collects signals and rules, then produces an immutable report.
 */
export class Guardian {
  private readonly signalStore: SignalStore;
  private readonly riskEngine: RiskEngine;

  constructor(config: GuardianConfig = {}) {
    const thresholds = config.levels ?? DEFAULT_RISK_LEVELS;
    this.signalStore = new SignalStore();

    const deps: RiskEngineDependencies = {
      signalStore: this.signalStore,
      ruleEvaluator: new RuleEvaluator(),
      scoreCalculator: new ScoreCalculator(),
      reportBuilder: new ReportBuilder(),
    };

    this.riskEngine = new RiskEngine(deps, thresholds);
  }

  /**
   * Add a signal value for risk evaluation.
   */
  signal(key: string, value: SignalValue): this {
    this.signalStore.set(key, value);
    return this;
  }

  /**
   * Register a rule. ID is auto-generated.
   */
  rule(input: CreateRuleInput): this {
    const rule = RuleBuilder.create(input);
    this.riskEngine.addRule(rule);
    return this;
  }

  /**
   * Run risk analysis and return an immutable report.
   */
  analyze(): RiskReport {
    return this.riskEngine.analyze();
  }

  /**
   * Clear all signals. Rules persist across resets.
   */
  reset(): this {
    this.signalStore.clear();
    return this;
  }
}
