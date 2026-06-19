import type { CreateRuleInput } from '../types/rules.js';
import type { SignalValue } from '../types/signals.js';

/** Common bot-detection signal keys. */
export interface BotDetectionSignals extends Record<string, SignalValue> {
  mouseLinearity: number;
  requestBurst: number;
  headlessUA: boolean;
  sessionAgeSeconds: number;
  requestsPerMinute: number;
}

/** Ready-to-use bot detection rules (customize scores for your app). */
export const botDetectionRules: readonly CreateRuleInput<BotDetectionSignals>[] = [
  {
    name: 'LinearMouseMovement',
    reason: 'Mouse movement is unnaturally linear',
    when: (s) => s.mouseLinearity > 0.9,
    score: 25,
  },
  {
    name: 'RequestBurst',
    reason: 'Unusually high request rate in short window',
    when: (s) => s.requestBurst > 50,
    score: 30,
  },
  {
    name: 'HeadlessBrowser',
    reason: 'User agent indicates headless browser',
    when: (s) => s.headlessUA === true,
    score: 40,
  },
  {
    name: 'NewSession',
    reason: 'Session is very new',
    when: (s) => s.sessionAgeSeconds < 10,
    score: 10,
  },
  {
    name: 'HighRequestRate',
    reason: 'Too many requests per minute',
    when: (s) => s.requestsPerMinute > 30,
    score: 35,
  },
];

/** Login brute-force rules — use with redis plugin signals. */
export const loginProtectionRules: readonly CreateRuleInput[] = [
  {
    name: 'BruteForceAttempts',
    reason: 'Multiple failed login attempts',
    when: (s) => (s.loginAttempts as number) > 5,
    score: 45,
    group: 'login',
  },
  {
    name: 'RapidLoginBurst',
    reason: 'Login attempts in rapid succession',
    when: (s) => (s.requestsPerMinute as number) > 10,
    score: 25,
    group: 'login',
  },
];
