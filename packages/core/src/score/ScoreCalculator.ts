import type { MatchedRule, RuleGroupCap } from '../types/rules.js';
import { MAX_TOTAL_SCORE } from '../constants/security.js';

/**
 * Calculates risk score from matched rules with optional per-group caps.
 */
export class ScoreCalculator {
  /**
   * Sum scores from matched rules, applying group caps when configured.
   */
  calculate(
    matchedRules: readonly MatchedRule[],
    groupCaps: readonly RuleGroupCap[] = [],
  ): number {
    const caps = new Map(groupCaps.map((cap) => [cap.name, cap.maxScore]));
    const grouped = new Map<string, number>();
    let ungroupedTotal = 0;

    for (const rule of matchedRules) {
      if (rule.group !== undefined) {
        grouped.set(rule.group, (grouped.get(rule.group) ?? 0) + rule.score);
      } else {
        ungroupedTotal += rule.score;
      }
    }

    let total = ungroupedTotal;

    for (const [groupName, groupScore] of grouped) {
      const cap = caps.get(groupName);
      total += cap !== undefined ? Math.min(groupScore, cap) : groupScore;
    }

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
