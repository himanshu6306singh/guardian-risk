import type { SignalMap } from '../types/signals.js';

/** A rule that evaluates signals and contributes risk when matched. */
export interface Rule<TSignals extends SignalMap = SignalMap> {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly score: number;
  readonly when: (signals: TSignals) => boolean;
  readonly reason?: string;
  readonly group?: string;
}

/** Input for creating a new rule (id is auto-generated). */
export interface CreateRuleInput<TSignals extends SignalMap = SignalMap> {
  readonly name: string;
  readonly description?: string;
  readonly score: number;
  readonly when: (signals: TSignals) => boolean;
  readonly reason?: string;
  readonly group?: string;
}

/** A rule that matched during evaluation. */
export interface MatchedRule {
  readonly id: string;
  readonly name: string;
  readonly score: number;
  readonly reason: string;
  readonly group?: string;
}

/** Cap applied to the sum of matched rules in a named group. */
export interface RuleGroupCap {
  readonly name: string;
  readonly maxScore: number;
}

/** Input for registering a group of related rules with an optional score cap. */
export interface RuleGroupInput<TSignals extends SignalMap = SignalMap> {
  readonly name: string;
  readonly maxScore?: number;
  readonly rules: readonly CreateRuleInput<TSignals>[];
}
