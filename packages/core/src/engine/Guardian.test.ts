import { describe, it, expect } from 'vitest';
import { Guardian } from './Guardian.js';
import { DEFAULT_RISK_LEVELS } from '../constants/defaults.js';

describe('Guardian', () => {
  it('provides fluent API for signals, rules, and analysis', () => {
    const guardian = new Guardian();

    const report = guardian
      .signal('postsPerMinute', 50)
      .signal('emailVerified', false)
      .rule({
        name: 'HighPosting',
        when: (s) => (s.postsPerMinute as number) > 20,
        score: 20,
      })
      .rule({
        name: 'UnverifiedEmail',
        when: (s) => s.emailVerified === false,
        score: 15,
      })
      .analyze();

    expect(report.score).toBe(35);
    expect(report.level).toBe('MEDIUM');
    expect(report.reasons).toEqual(['HighPosting', 'UnverifiedEmail']);
    expect(report.matchedRules).toHaveLength(2);
    expect(Object.isFrozen(report)).toBe(true);
  });

  it('uses default risk levels when none configured', () => {
    const guardian = new Guardian();
    guardian
      .signal('risk', true)
      .rule({ name: 'HighRisk', when: () => true, score: 75 });

    const report = guardian.analyze();
    expect(report.level).toBe('CRITICAL');
  });

  it('accepts custom risk level thresholds', () => {
    const guardian = new Guardian({
      levels: [
        { max: 10, level: 'SAFE' },
        { max: Infinity, level: 'DANGER' },
      ],
    });

    guardian
      .signal('x', 1)
      .rule({ name: 'R', when: () => true, score: 25 });

    const report = guardian.analyze();
    expect(report.level).toBe('DANGER');
  });

  it('clears signals on reset but keeps rules', () => {
    const guardian = new Guardian();
    guardian
      .signal('postsPerMinute', 50)
      .rule({
        name: 'HighPosting',
        when: (s) => (s.postsPerMinute as number) > 20,
        score: 20,
      });

    const first = guardian.analyze();
    expect(first.score).toBe(20);

    guardian.reset();
    const second = guardian.analyze();
    expect(second.score).toBe(0);
    expect(second.matchedRules).toHaveLength(0);
  });

  it('returns LOW level for zero score with default thresholds', () => {
    const guardian = new Guardian();
    const report = guardian.analyze();
    expect(report.score).toBe(0);
    expect(report.level).toBe('LOW');
  });

  it('exposes default risk levels constant', () => {
    expect(DEFAULT_RISK_LEVELS).toHaveLength(4);
    expect(DEFAULT_RISK_LEVELS[0]?.level).toBe('LOW');
  });
});
