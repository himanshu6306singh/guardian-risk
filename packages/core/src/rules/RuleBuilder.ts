import type { CreateRuleInput, Rule } from '../types/rules.js';
import type { SignalMap } from '../types/signals.js';
import { generateId, validateRuleInput } from '../utils/validation.js';

/**
 * Builds immutable rule definitions with auto-generated IDs.
 */
export class RuleBuilder {
  /**
   * Create a new rule from input configuration.
   */
  static create<TSignals extends SignalMap = SignalMap>(
    input: CreateRuleInput<TSignals>,
  ): Rule<TSignals> {
    validateRuleInput(input as CreateRuleInput<SignalMap>);

    const rule: Rule<TSignals> = {
      id: generateId(),
      name: input.name,
      score: input.score,
      when: input.when,
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.reason !== undefined ? { reason: input.reason } : {}),
      ...(input.group !== undefined ? { group: input.group } : {}),
    };

    return rule;
  }
}
