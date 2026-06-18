import { DEFAULT_RISK_LEVELS } from '../constants/defaults.js';
import { MAX_RULES } from '../constants/security.js';
import { ReportBuilder } from '../report/Report.js';
import { RuleEvaluator } from '../rules/RuleEvaluator.js';
import { ScoreCalculator } from '../score/ScoreCalculator.js';
import { SignalStore } from '../signals/SignalStore.js';
import type { Rule } from '../types/rules.js';
import type { RiskReport, RiskLevelThreshold } from '../types/report.js';
import type { SignalMap } from '../types/signals.js';

/** Dependencies injected into RiskEngine. */
export interface RiskEngineDependencies {
  readonly signalStore: SignalStore;
  readonly ruleEvaluator: RuleEvaluator;
  readonly scoreCalculator: ScoreCalculator;
  readonly reportBuilder: ReportBuilder;
}

/**
 * Orchestrates signal evaluation, scoring, and report generation.
 */
export class RiskEngine {
  private readonly rules: Rule<SignalMap>[] = [];
  private readonly thresholds: readonly RiskLevelThreshold[];

  constructor(
    private readonly deps: RiskEngineDependencies,
    thresholds: readonly RiskLevelThreshold[] = DEFAULT_RISK_LEVELS,
  ) {
    this.thresholds = thresholds;
  }

  /**
   * Register a rule for evaluation.
   */
  addRule(rule: Rule<SignalMap>): void {
    if (this.rules.length >= MAX_RULES) {
      throw new RangeError(`Cannot exceed maximum of ${MAX_RULES} rules`);
    }
    this.rules.push(rule);
  }

  /**
   * Get all registered rules.
   */
  getRules(): readonly Rule<SignalMap>[] {
    return this.rules;
  }

  /**
   * Run the full risk analysis pipeline.
   */
  analyze(): RiskReport {
    const signals = this.deps.signalStore.getAll();
    const matchedRules = this.deps.ruleEvaluator.evaluate(this.rules, signals);
    const score = this.deps.scoreCalculator.calculate(matchedRules);

    return this.deps.reportBuilder.build(score, matchedRules, this.thresholds);
  }
}
