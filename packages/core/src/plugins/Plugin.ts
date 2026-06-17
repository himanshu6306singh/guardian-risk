import type { Guardian } from '../engine/Guardian.js';

/**
 * Extension point for adding capabilities to Guardian without modifying core.
 * Plugins may register signals, rules, or helpers during installation.
 */
export interface Plugin {
  readonly name: string;
  install(guardian: Guardian): void;
}
