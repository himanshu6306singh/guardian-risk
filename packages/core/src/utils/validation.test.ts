import { describe, it, expect } from 'vitest';
import { validateSignalValue } from './validation.js';
import { resolveLevel } from './resolveLevel.js';
import { DEFAULT_RISK_LEVELS } from '../constants/defaults.js';

describe('validateSignalValue', () => {
  it('accepts primitives and null', () => {
    expect(validateSignalValue('text')).toBe(true);
    expect(validateSignalValue(42)).toBe(true);
    expect(validateSignalValue(true)).toBe(true);
    expect(validateSignalValue(false)).toBe(true);
    expect(validateSignalValue(null)).toBe(true);
  });

  it('rejects objects, arrays, and undefined', () => {
    expect(validateSignalValue({})).toBe(false);
    expect(validateSignalValue([])).toBe(false);
    expect(validateSignalValue(undefined)).toBe(false);
  });
});

describe('resolveLevel', () => {
  it('resolves levels using default thresholds', () => {
    expect(resolveLevel(0)).toBe('LOW');
    expect(resolveLevel(20)).toBe('LOW');
    expect(resolveLevel(21)).toBe('MEDIUM');
    expect(resolveLevel(40)).toBe('MEDIUM');
    expect(resolveLevel(41)).toBe('HIGH');
    expect(resolveLevel(60)).toBe('HIGH');
    expect(resolveLevel(61)).toBe('CRITICAL');
    expect(resolveLevel(100)).toBe('CRITICAL');
  });

  it('uses custom thresholds when provided', () => {
    const custom = [
      { max: 5, level: 'SAFE' },
      { max: Infinity, level: 'UNSAFE' },
    ] as const;

    expect(resolveLevel(3, custom)).toBe('SAFE');
    expect(resolveLevel(10, custom)).toBe('UNSAFE');
  });

  it('falls back to UNKNOWN for empty thresholds', () => {
    expect(resolveLevel(10, [])).toBe('UNKNOWN');
  });

  it('uses last threshold level when score exceeds all', () => {
    const thresholds = [{ max: 10, level: 'LOW' }];
    expect(resolveLevel(100, thresholds)).toBe('LOW');
  });

  it('exports consistent default levels', () => {
    expect(resolveLevel(0, DEFAULT_RISK_LEVELS)).toBe('LOW');
    expect(resolveLevel(61, DEFAULT_RISK_LEVELS)).toBe('CRITICAL');
  });
});
