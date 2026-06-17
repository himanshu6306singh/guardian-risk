import type { RiskLevelThreshold } from '../types/report.js';
import { DEFAULT_RISK_LEVELS } from '../constants/defaults.js';

/**
 * Resolves a risk level label from a score using configured thresholds.
 * Thresholds are evaluated in order; the first threshold where score <= max wins.
 */
export function resolveLevel(
  score: number,
  thresholds: readonly RiskLevelThreshold[] = DEFAULT_RISK_LEVELS,
): string {
  for (const threshold of thresholds) {
    if (score <= threshold.max) {
      return threshold.level;
    }
  }

  const last = thresholds[thresholds.length - 1];
  return last?.level ?? 'UNKNOWN';
}
