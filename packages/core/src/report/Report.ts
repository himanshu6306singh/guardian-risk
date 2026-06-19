import type { MatchedRule } from '../types/rules.js';
import type { RiskReport } from '../types/report.js';
import { resolveLevel } from '../utils/resolveLevel.js';
import type { RiskLevelThreshold } from '../types/report.js';

/**
 * Builds immutable risk reports.
 */
export class ReportBuilder {
  /**
   * Build a frozen risk report from evaluation results.
   */
  build(
    score: number,
    matchedRules: readonly MatchedRule[],
    thresholds: readonly RiskLevelThreshold[],
    analyzedAt: string = new Date().toISOString(),
  ): RiskReport {
    const reasons = matchedRules.map((rule) => rule.reason);
    const level = resolveLevel(score, thresholds);

    const frozenRules = matchedRules.map((rule) =>
      Object.freeze({ ...rule }),
    ) as MatchedRule[];

    const report: RiskReport = {
      score,
      level,
      reasons: Object.freeze([...reasons]),
      matchedRules: Object.freeze(frozenRules),
      analyzedAt,
    };

    return Object.freeze(report);
  }
}
