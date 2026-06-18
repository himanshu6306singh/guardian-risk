import { randomUUID } from 'node:crypto';
import {
  BLOCKED_SIGNAL_KEYS,
  MAX_KEY_LENGTH,
  MAX_RULE_SCORE,
} from '../constants/security.js';
import type { CreateRuleInput } from '../types/rules.js';
import type { Plugin } from '../plugins/Plugin.js';
import type { RiskLevelThreshold } from '../types/report.js';
import type { SignalMap, SignalValue } from '../types/signals.js';

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
 * Validates a signal key is safe (no prototype pollution, bounded length).
 */
export function validateSignalKey(key: string): void {
  if (typeof key !== 'string' || key.length === 0) {
    throw new TypeError('Signal key must be a non-empty string');
  }

  if (key.length > MAX_KEY_LENGTH) {
    throw new TypeError(`Signal key exceeds maximum length of ${MAX_KEY_LENGTH}`);
  }

  if (BLOCKED_SIGNAL_KEYS.has(key)) {
    throw new TypeError(`Signal key "${key}" is not allowed`);
  }
}

/**
 * Validates rule input before registration.
 */
export function validateRuleInput(input: CreateRuleInput<SignalMap>): void {
  if (typeof input.name !== 'string' || input.name.trim().length === 0) {
    throw new TypeError('Rule name must be a non-empty string');
  }

  if (input.name.length > MAX_KEY_LENGTH) {
    throw new TypeError(`Rule name exceeds maximum length of ${MAX_KEY_LENGTH}`);
  }

  if (typeof input.when !== 'function') {
    throw new TypeError('Rule when must be a function');
  }

  if (typeof input.score !== 'number' || !Number.isFinite(input.score)) {
    throw new TypeError('Rule score must be a finite number');
  }

  if (Math.abs(input.score) > MAX_RULE_SCORE) {
    throw new TypeError(`Rule score must be between -${MAX_RULE_SCORE} and ${MAX_RULE_SCORE}`);
  }

  if (input.reason !== undefined) {
    if (typeof input.reason !== 'string') {
      throw new TypeError('Rule reason must be a string');
    }
    if (input.reason.length > MAX_KEY_LENGTH) {
      throw new TypeError(`Rule reason exceeds maximum length of ${MAX_KEY_LENGTH}`);
    }
  }

  if (input.description !== undefined) {
    if (typeof input.description !== 'string') {
      throw new TypeError('Rule description must be a string');
    }
    if (input.description.length > MAX_KEY_LENGTH) {
      throw new TypeError(`Rule description exceeds maximum length of ${MAX_KEY_LENGTH}`);
    }
  }
}

/**
 * Validates a plugin before installation.
 */
export function validatePlugin(plugin: Plugin): void {
  if (typeof plugin.name !== 'string' || plugin.name.trim().length === 0) {
    throw new TypeError('Plugin name must be a non-empty string');
  }

  if (plugin.name.length > MAX_KEY_LENGTH) {
    throw new TypeError(`Plugin name exceeds maximum length of ${MAX_KEY_LENGTH}`);
  }

  if (typeof plugin.install !== 'function') {
    throw new TypeError('Plugin install must be a function');
  }
}

/**
 * Validates custom risk level thresholds.
 */
export function validateRiskLevels(levels: readonly RiskLevelThreshold[]): void {
  if (levels.length === 0) {
    throw new TypeError('Risk levels must contain at least one threshold');
  }

  for (const threshold of levels) {
    if (typeof threshold.level !== 'string' || threshold.level.trim().length === 0) {
      throw new TypeError('Risk level label must be a non-empty string');
    }

    if (typeof threshold.max !== 'number' || (!Number.isFinite(threshold.max) && threshold.max !== Infinity)) {
      throw new TypeError('Risk level max must be a finite number or Infinity');
    }
  }
}

/**
 * Generates a cryptographically secure unique identifier for rules.
 */
export function generateId(): string {
  return randomUUID();
}
