import { describe, it, expect } from 'vitest';
import { RuleBuilder } from './RuleBuilder.js';
import { RuleEvaluator } from './RuleEvaluator.js';
import type { Rule } from '../types/rules.js';
import type { SignalMap } from '../types/signals.js';

describe('RuleBuilder', () => {
  it('creates a rule with auto-generated id', () => {
    const rule = RuleBuilder.create({
      name: 'TestRule',
      when: () => true,
      score: 10,
    });

    expect(rule.id).toBeDefined();
    expect(rule.name).toBe('TestRule');
    expect(rule.score).toBe(10);
  });

  it('includes optional description and reason', () => {
    const rule = RuleBuilder.create({
      name: 'TestRule',
      description: 'A test rule',
      reason: 'Custom reason',
      when: () => true,
      score: 5,
    });

    expect(rule.description).toBe('A test rule');
    expect(rule.reason).toBe('Custom reason');
  });
});

describe('RuleEvaluator', () => {
  const signals: SignalMap = {
    postsPerMinute: 50,
    emailVerified: false,
  };

  const rules: Rule<SignalMap>[] = [
    RuleBuilder.create({
      name: 'HighPosting',
      when: (s) => (s.postsPerMinute as number) > 20,
      score: 20,
    }),
    RuleBuilder.create({
      name: 'UnverifiedEmail',
      when: (s) => s.emailVerified === false,
      score: 15,
    }),
    RuleBuilder.create({
      name: 'NeverMatch',
      when: () => false,
      score: 100,
    }),
  ];

  it('returns matched rules in registration order', () => {
    const evaluator = new RuleEvaluator();
    const matched = evaluator.evaluate(rules, signals);

    expect(matched).toHaveLength(2);
    expect(matched[0]?.name).toBe('HighPosting');
    expect(matched[1]?.name).toBe('UnverifiedEmail');
  });

  it('uses rule name as reason when reason is omitted', () => {
    const evaluator = new RuleEvaluator();
    const matched = evaluator.evaluate(rules, signals);

    expect(matched[0]?.reason).toBe('HighPosting');
  });

  it('returns empty array when no rules match', () => {
    const evaluator = new RuleEvaluator();
    const matched = evaluator.evaluate(
      [RuleBuilder.create({ name: 'NoMatch', when: () => false, score: 10 })],
      signals,
    );

    expect(matched).toEqual([]);
  });

  it('returns empty array for empty rules list', () => {
    const evaluator = new RuleEvaluator();
    const matched = evaluator.evaluate([], signals);
    expect(matched).toEqual([]);
  });

  it('evaluates all rules without short-circuiting', () => {
    const evaluator = new RuleEvaluator();
    const allMatch = [
      RuleBuilder.create({ name: 'R1', when: () => true, score: 10 }),
      RuleBuilder.create({ name: 'R2', when: () => true, score: 20 }),
    ];
    const matched = evaluator.evaluate(allMatch, signals);
    expect(matched).toHaveLength(2);
  });
});
