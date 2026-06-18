import { describe, it, expect } from 'vitest';
import {
  validateSignalValue,
  validateSignalKey,
  validateRuleInput,
  validatePlugin,
  validateRiskLevels,
} from './validation.js';
import { resolveLevel } from './resolveLevel.js';
import { DEFAULT_RISK_LEVELS } from '../constants/defaults.js';
import { RuleEvaluator } from '../rules/RuleEvaluator.js';
import { RuleBuilder } from '../rules/RuleBuilder.js';

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

describe('validateSignalKey', () => {
  it('rejects empty keys', () => {
    expect(() => validateSignalKey('')).toThrow(TypeError);
  });

  it('rejects prototype pollution keys', () => {
    expect(() => validateSignalKey('__proto__')).toThrow(TypeError);
    expect(() => validateSignalKey('constructor')).toThrow(TypeError);
    expect(() => validateSignalKey('prototype')).toThrow(TypeError);
  });

  it('rejects keys exceeding max length', () => {
    expect(() => validateSignalKey('a'.repeat(300))).toThrow(TypeError);
  });
});

describe('validateRuleInput', () => {
  it('rejects invalid rule definitions', () => {
    expect(() =>
      validateRuleInput({ name: '', when: () => true, score: 1 }),
    ).toThrow(TypeError);
    expect(() =>
      validateRuleInput({ name: 'x', when: 'bad' as never, score: 1 }),
    ).toThrow(TypeError);
    expect(() =>
      validateRuleInput({ name: 'x', when: () => true, score: NaN }),
    ).toThrow(TypeError);
  });

  it('rejects scores outside safe bounds', () => {
    expect(() =>
      validateRuleInput({ name: 'x', when: () => true, score: 20_000 }),
    ).toThrow(TypeError);
  });

  it('rejects oversized reason strings', () => {
    expect(() =>
      validateRuleInput({
        name: 'x',
        when: () => true,
        score: 1,
        reason: 'a'.repeat(300),
      }),
    ).toThrow(TypeError);
  });

  it('rejects non-string reason and description', () => {
    expect(() =>
      validateRuleInput({
        name: 'x',
        when: () => true,
        score: 1,
        reason: 1 as never,
      }),
    ).toThrow(TypeError);
    expect(() =>
      validateRuleInput({
        name: 'x',
        when: () => true,
        score: 1,
        description: false as never,
      }),
    ).toThrow(TypeError);
  });

  it('rejects oversized rule names and descriptions', () => {
    expect(() =>
      validateRuleInput({
        name: 'a'.repeat(300),
        when: () => true,
        score: 1,
      }),
    ).toThrow(TypeError);
    expect(() =>
      validateRuleInput({
        name: 'x',
        when: () => true,
        score: 1,
        description: 'a'.repeat(300),
      }),
    ).toThrow(TypeError);
  });
});

describe('validatePlugin', () => {
  it('rejects invalid plugins', () => {
    expect(() => validatePlugin({ name: '', install: () => {} })).toThrow(TypeError);
    expect(() => validatePlugin({ name: 'ok', install: 'bad' as never })).toThrow(TypeError);
  });

  it('rejects oversized plugin names', () => {
    expect(() =>
      validatePlugin({ name: 'a'.repeat(300), install: () => {} }),
    ).toThrow(TypeError);
  });
});

describe('validateRiskLevels', () => {
  it('rejects empty thresholds', () => {
    expect(() => validateRiskLevels([])).toThrow(TypeError);
  });

  it('rejects invalid threshold fields', () => {
    expect(() => validateRiskLevels([{ max: 10, level: '' }])).toThrow(TypeError);
    expect(() => validateRiskLevels([{ max: NaN, level: 'LOW' }])).toThrow(TypeError);
  });

  it('allows Infinity as max threshold', () => {
    expect(() =>
      validateRiskLevels([{ max: Infinity, level: 'CRITICAL' }]),
    ).not.toThrow();
  });
});

describe('RuleEvaluator security', () => {
  it('treats throwing when() as non-match', () => {
    const evaluator = new RuleEvaluator();
    const rules = [
      RuleBuilder.create({
        name: 'Throws',
        when: () => {
          throw new Error('boom');
        },
        score: 100,
      }),
    ];

    expect(evaluator.evaluate(rules, {})).toEqual([]);
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
