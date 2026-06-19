import { describe, it, expect } from 'vitest';
import { computeMouseLinearity } from './collector.js';

describe('computeMouseLinearity', () => {
  it('returns 0 for fewer than 3 points', () => {
    expect(computeMouseLinearity([{ x: 0, y: 0, t: 0 }])).toBe(0);
  });

  it('returns high linearity for a straight path', () => {
    const points = [
      { x: 0, y: 0, t: 0 },
      { x: 10, y: 0, t: 1 },
      { x: 20, y: 0, t: 2 },
      { x: 30, y: 0, t: 3 },
    ];
    expect(computeMouseLinearity(points)).toBeGreaterThan(0.99);
  });

  it('returns lower linearity for a zig-zag path', () => {
    const points = [
      { x: 0, y: 0, t: 0 },
      { x: 10, y: 20, t: 1 },
      { x: 20, y: 0, t: 2 },
      { x: 30, y: 20, t: 3 },
    ];
    expect(computeMouseLinearity(points)).toBeLessThan(0.8);
  });
});
