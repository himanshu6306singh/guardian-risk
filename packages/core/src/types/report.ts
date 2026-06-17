import type { MatchedRule } from '../types/rules.js';

/** Immutable risk analysis report. */
export interface RiskReport {
  readonly score: number;
  readonly level: string;
  readonly reasons: readonly string[];
  readonly matchedRules: readonly MatchedRule[];
  readonly analyzedAt: string;
}

/** Threshold mapping a maximum score to a risk level label. */
export interface RiskLevelThreshold {
  readonly max: number;
  readonly level: string;
}

/** Configuration options for Guardian. */
export interface GuardianConfig {
  readonly levels?: readonly RiskLevelThreshold[];
}
