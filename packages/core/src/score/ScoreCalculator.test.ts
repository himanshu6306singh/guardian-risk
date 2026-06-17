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
});
