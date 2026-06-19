import { Guardian } from '../engine/Guardian.js';
import type { GuardianConfig } from '../types/report.js';
import type { CreateRuleInput } from '../types/rules.js';
import type { SignalMap } from '../types/signals.js';

/** Guardian with typed signal keys and rule predicates. */
export type TypedGuardian<TSignals extends SignalMap> = Guardian & {
  signal<K extends keyof TSignals & string>(key: K, value: TSignals[K]): TypedGuardian<TSignals>;
  rule(input: CreateRuleInput<TSignals>): TypedGuardian<TSignals>;
};

/**
 * Define a typed signal schema for compile-time key/value checking.
 *
 * @example
 * ```typescript
 * const botSignals = defineSignals<{
 *   mouseLinearity: number;
 *   headlessUA: boolean;
 * }>();
 *
 * const guardian = botSignals.create()
 *   .signal('mouseLinearity', 0.95) // typed
 *   .rule({ name: 'Linear', when: (s) => s.mouseLinearity > 0.9, score: 20 });
 * ```
 */
export function defineSignals<TSignals extends SignalMap>(): {
  create(config?: GuardianConfig): TypedGuardian<TSignals>;
} {
  return {
    create(config?: GuardianConfig): TypedGuardian<TSignals> {
      return new Guardian(config) as TypedGuardian<TSignals>;
    },
  };
}
