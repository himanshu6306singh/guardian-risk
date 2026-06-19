import { describe, it, expect } from 'vitest';
import { Guardian, defineSignals, applyRules, botDetectionRules, loginProtectionRules } from '../index.js';

describe('defineSignals', () => {
  it('creates a guardian with typed signal keys', () => {
    const bot = defineSignals<{ riskScore: number; verified: boolean }>();
    const guardian = bot.create();

    guardian
      .signal('riskScore', 10)
      .signal('verified', false)
      .rule({ name: 'High', when: (s) => s.riskScore > 5, score: 10 });

    expect(guardian.analyze().score).toBe(10);
  });
});

describe('applyRules', () => {
  it('registers preset rules', () => {
    const guardian = applyRules(new Guardian(), botDetectionRules);
    guardian
      .signal('mouseLinearity', 0.95)
      .signal('requestBurst', 0)
      .signal('headlessUA', false)
      .signal('sessionAgeSeconds', 100)
      .signal('requestsPerMinute', 0);

    expect(guardian.analyze().score).toBe(25);
  });
});

describe('ruleGroup', () => {
  it('caps combined group score', () => {
    const guardian = new Guardian().ruleGroup({
      name: 'login',
      maxScore: 40,
      rules: [
        { name: 'A', when: () => true, score: 30 },
        { name: 'B', when: () => true, score: 30 },
      ],
    });

    expect(guardian.analyze().score).toBe(40);
  });
});

describe('loginProtectionRules', () => {
  it('flags brute-force and rapid login patterns', () => {
    const guardian = applyRules(new Guardian(), loginProtectionRules);
    guardian
      .signal('loginAttempts', 6)
      .signal('requestsPerMinute', 15);

    expect(guardian.analyze().score).toBe(70);
  });
});
