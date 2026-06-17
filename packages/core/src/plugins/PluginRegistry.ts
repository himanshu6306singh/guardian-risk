import type { Guardian } from '../engine/Guardian.js';
import type { Plugin } from './Plugin.js';

/**
 * Thrown when attempting to register a plugin that is already installed.
 */
export class PluginAlreadyInstalledError extends Error {
  constructor(pluginName: string) {
    super(`Plugin "${pluginName}" is already installed`);
    this.name = 'PluginAlreadyInstalledError';
  }
}

/**
 * Manages plugin lifecycle: register once, track installed plugins.
 */
export class PluginRegistry {
  private readonly installed = new Set<string>();

  /**
   * Install a plugin on the given Guardian instance.
   * Each plugin name may only be installed once per Guardian instance.
   */
  install(plugin: Plugin, guardian: Guardian): void {
    if (this.installed.has(plugin.name)) {
      throw new PluginAlreadyInstalledError(plugin.name);
    }

    plugin.install(guardian);
    this.installed.add(plugin.name);
  }

  /**
   * Check if a plugin is installed by name.
   */
  has(name: string): boolean {
    return this.installed.has(name);
  }

  /**
   * Get names of all installed plugins in registration order.
   */
  getInstalled(): readonly string[] {
    return [...this.installed];
  }
}
