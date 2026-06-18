import type { MatchedRule } from '../types/rules.js';
import { MAX_TOTAL_SCORE } from '../constants/security.js';

/**
 * Calculates risk score from matched rules.
 */
export class ScoreCalculator {
  /**
   * Sum scores from all matched rules, clamped to a safe maximum.
   */
  calculate(matchedRules: readonly MatchedRule[]): number {
    const total = matchedRules.reduce((sum, rule) => sum + rule.score, 0);

    if (!Number.isFinite(total)) {
      return 0;
    }

    if (total > MAX_TOTAL_SCORE) {
      return MAX_TOTAL_SCORE;
    }

    if (total < -MAX_TOTAL_SCORE) {
      return -MAX_TOTAL_SCORE;
    }

    return total;
  }
}
