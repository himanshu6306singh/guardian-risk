import type { SignalMap } from '../types/signals.js';

/** A rule that evaluates signals and contributes risk when matched. */
export interface Rule<TSignals extends SignalMap = SignalMap> {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly score: number;
  readonly when: (signals: TSignals) => boolean;
  readonly reason?: string;
}

/** Input for creating a new rule (id is auto-generated). */
export interface CreateRuleInput<TSignals extends SignalMap = SignalMap> {
  readonly name: string;
  readonly description?: string;
  readonly score: number;
  readonly when: (signals: TSignals) => boolean;
  readonly reason?: string;
}

/** A rule that matched during evaluation. */
export interface MatchedRule {
  readonly id: string;
  readonly name: string;
  readonly score: number;
  readonly reason: string;
}
