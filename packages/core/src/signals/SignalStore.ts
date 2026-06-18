import type { SignalMap, SignalValue } from '../types/signals.js';
import { MAX_SIGNALS } from '../constants/security.js';
import { validateSignalKey, validateSignalValue } from '../utils/validation.js';

/**
 * Stores and retrieves signal values for risk evaluation.
 */
export class SignalStore {
  private readonly signals = new Map<string, SignalValue>();

  /**
   * Set a signal value. Overwrites any existing value for the key.
   */
  set(key: string, value: SignalValue): this {
    validateSignalKey(key);

    if (!validateSignalValue(value)) {
      throw new TypeError(
        `Invalid signal value for "${key}": signals must be string, number, boolean, or null`,
      );
    }

    if (!this.signals.has(key) && this.signals.size >= MAX_SIGNALS) {
      throw new RangeError(`Cannot exceed maximum of ${MAX_SIGNALS} signals`);
    }

    this.signals.set(key, value);
    return this;
  }

  /**
   * Get a signal value by key.
   */
  get(key: string): SignalValue | undefined {
    return this.signals.get(key);
  }

  /**
   * Check if a signal exists.
   */
  has(key: string): boolean {
    return this.signals.has(key);
  }

  /**
   * Returns a frozen snapshot of all signals.
   */
  getAll(): SignalMap {
    const snapshot = Object.create(null) as Record<string, SignalValue>;
    for (const [key, value] of this.signals) {
      snapshot[key] = value;
    }
    return Object.freeze(snapshot);
  }

  /**
   * Clear all signals.
   */
  clear(): void {
    this.signals.clear();
  }
}
