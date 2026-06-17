import type { MatchedRule, Rule } from '../types/rules.js';
import type { SignalMap } from '../types/signals.js';

/**
 * Evaluates rules against a signal map and returns matched rules.
 */
export class RuleEvaluator {
  /**
   * Evaluate all rules against the given signals.
   * Rules are evaluated in registration order (exhaustive, no short-circuit).
   */
  evaluate<TSignals extends SignalMap>(
    rules: readonly Rule<TSignals>[],
    signals: TSignals,
  ): MatchedRule[] {
    const matched: MatchedRule[] = [];

    for (const rule of rules) {
      if (rule.when(signals)) {
        matched.push({
          id: rule.id,
          name: rule.name,
          score: rule.score,
          reason: rule.reason ?? rule.name,
        });
      }
    }

    return matched;
  }
}
