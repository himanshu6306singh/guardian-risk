import type { Guardian } from '../engine/Guardian.js';
import type { CreateRuleInput } from '../types/rules.js';
import type { SignalMap } from '../types/signals.js';

/**
 * Register a list of preset rules on a Guardian instance.
 */
export function applyRules<TSignals extends SignalMap = SignalMap>(
  guardian: Guardian,
  rules: readonly CreateRuleInput<TSignals>[],
): Guardian {
  for (const rule of rules) {
    guardian.rule(rule as CreateRuleInput);
  }
  return guardian;
}
