import type { SignalMap, SignalValue } from '../types/signals.js';
import { validateSignalValue } from '../utils/validation.js';

/**
 * Stores and retrieves signal values for risk evaluation.
 */
export class SignalStore {
  private readonly signals = new Map<string, SignalValue>();

  /**
   * Set a signal value. Overwrites any existing value for the key.
   */
  set(key: string, value: SignalValue): this {
    if (!validateSignalValue(value)) {
      throw new TypeError(
        `Invalid signal value for "${key}": signals must be string, number, boolean, or null`,
      );
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
    const snapshot: Record<string, SignalValue> = {};
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
