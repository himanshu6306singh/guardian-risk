import type { RiskLevelThreshold } from '../types/report.js';

/** Default risk level thresholds used when none are configured. */
export const DEFAULT_RISK_LEVELS: readonly RiskLevelThreshold[] = [
  { max: 20, level: 'LOW' },
  { max: 40, level: 'MEDIUM' },
  { max: 60, level: 'HIGH' },
  { max: Infinity, level: 'CRITICAL' },
] as const;
