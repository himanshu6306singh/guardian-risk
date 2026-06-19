import { describe, it, expect } from 'vitest';
import { ScoreCalculator } from './ScoreCalculator.js';
import type { MatchedRule } from '../types/rules.js';

describe('ScoreCalculator', () => {
  const calculator = new ScoreCalculator();

  it('sums matched rule scores', () => {
    const matched: MatchedRule[] = [
      { id: '1', name: 'A', score: 20, reason: 'A' },
      { id: '2', name: 'B', score: 15, reason: 'B' },
    ];

    expect(calculator.calculate(matched)).toBe(35);
  });

  it('returns zero for no matched rules', () => {
    expect(calculator.calculate([])).toBe(0);
  });

  it('allows negative scores to reduce total', () => {
    const matched: MatchedRule[] = [
      { id: '1', name: 'Risk', score: 30, reason: 'Risk' },
      { id: '2', name: 'Trust', score: -10, reason: 'Trust' },
    ];

    expect(calculator.calculate(matched)).toBe(20);
  });

  it('clamps total score to a safe maximum', () => {
    const matched: MatchedRule[] = Array.from({ length: 200 }, (_, i) => ({
      id: String(i),
      name: `Rule${i}`,
      score: 10_000,
      reason: 'High',
    }));

    expect(calculator.calculate(matched)).toBe(1_000_000);
  });

  it('clamps negative total score to a safe minimum', () => {
    const matched: MatchedRule[] = Array.from({ length: 200 }, (_, i) => ({
      id: String(i),
      name: `Rule${i}`,
      score: -10_000,
      reason: 'Low',
    }));

    expect(calculator.calculate(matched)).toBe(-1_000_000);
  });

  it('returns zero when total is not finite', () => {
    const matched: MatchedRule[] = [
      { id: '1', name: 'A', score: Number.POSITIVE_INFINITY, reason: 'A' },
      { id: '2', name: 'B', score: 1, reason: 'B' },
    ];

    expect(calculator.calculate(matched)).toBe(0);
  });

  it('applies per-group score caps', () => {
    const matched: MatchedRule[] = [
      { id: '1', name: 'A', score: 30, reason: 'A', group: 'login' },
      { id: '2', name: 'B', score: 30, reason: 'B', group: 'login' },
      { id: '3', name: 'C', score: 10, reason: 'C' },
    ];

    const score = calculator.calculate(matched, [{ name: 'login', maxScore: 40 }]);
    expect(score).toBe(50);
  });
});
