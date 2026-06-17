import { randomUUID } from 'node:crypto';
import type { SignalValue } from '../types/signals.js';

/**
 * Validates that a value is an allowed signal primitive.
 * Signals must be string, number, boolean, or null — not objects or arrays.
 */
export function validateSignalValue(value: unknown): value is SignalValue {
  if (value === null) {
    return true;
  }

  const type = typeof value;
  return type === 'string' || type === 'number' || type === 'boolean';
}

/**
 * Generates a unique identifier for rules.
 */
export function generateId(): string {
  return randomUUID();
}
