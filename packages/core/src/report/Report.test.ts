import { describe, it, expect } from 'vitest';
import { ReportBuilder } from './Report.js';
import { DEFAULT_RISK_LEVELS } from '../constants/defaults.js';
import type { MatchedRule } from '../types/rules.js';

describe('ReportBuilder', () => {
  const builder = new ReportBuilder();

  const matched: MatchedRule[] = [
    { id: '1', name: 'HighPosting', score: 20, reason: 'High posting rate' },
    { id: '2', name: 'UnverifiedEmail', score: 15, reason: 'Unverified email' },
  ];

  it('builds a frozen report with correct score and level', () => {
    const report = builder.build(35, matched, DEFAULT_RISK_LEVELS);

    expect(report.score).toBe(35);
    expect(report.level).toBe('MEDIUM');
    expect(report.reasons).toEqual(['High posting rate', 'Unverified email']);
    expect(report.matchedRules).toHaveLength(2);
    expect(Object.isFrozen(report)).toBe(true);
    expect(Object.isFrozen(report.reasons)).toBe(true);
    expect(Object.isFrozen(report.matchedRules)).toBe(true);
  });

  it('includes analyzedAt timestamp', () => {
    const fixedDate = '2026-01-01T00:00:00.000Z';
    const report = builder.build(0, [], DEFAULT_RISK_LEVELS, fixedDate);
    expect(report.analyzedAt).toBe(fixedDate);
  });

  it('resolves CRITICAL level for high scores', () => {
    const report = builder.build(75, matched, DEFAULT_RISK_LEVELS);
    expect(report.level).toBe('CRITICAL');
  });

  it('resolves LOW level for low scores', () => {
    const report = builder.build(10, [], DEFAULT_RISK_LEVELS);
    expect(report.level).toBe('LOW');
  });
});
