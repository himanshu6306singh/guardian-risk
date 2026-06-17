import type { MatchedRule } from '../types/rules.js';

/**
 * Calculates risk score from matched rules.
 */
export class ScoreCalculator {
  /**
   * Sum scores from all matched rules.
   */
  calculate(matchedRules: readonly MatchedRule[]): number {
    return matchedRules.reduce((total, rule) => total + rule.score, 0);
  }
}
