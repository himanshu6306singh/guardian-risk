/** Maximum allowed rules per Guardian instance (DoS protection). */
export const MAX_RULES = 1_000;

/** Maximum allowed signal keys per Guardian instance. */
export const MAX_SIGNALS = 1_000;

/** Maximum length for signal keys, rule names, and plugin names. */
export const MAX_KEY_LENGTH = 256;

/** Maximum absolute value for a single rule score. */
export const MAX_RULE_SCORE = 10_000;

/** Maximum total score after summing matched rules (overflow / DoS protection). */
export const MAX_TOTAL_SCORE = 1_000_000;

/** Keys blocked to prevent prototype pollution. */
export const BLOCKED_SIGNAL_KEYS = new Set([
  '__proto__',
  'constructor',
  'prototype',
]);
