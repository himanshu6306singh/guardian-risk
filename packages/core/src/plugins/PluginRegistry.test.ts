import { describe, it, expect } from 'vitest';
import { Guardian } from '../engine/Guardian.js';
import { PluginAlreadyInstalledError, PluginInstallError, PluginRegistry } from './PluginRegistry.js';
import type { Plugin } from './Plugin.js';

function createPlugin(
  name: string,
  onInstall?: (guardian: Guardian) => void,
): Plugin {
  return {
    name,
    install(guardian): void {
      onInstall?.(guardian);
    },
  };
}

describe('PluginRegistry', () => {
  it('installs a plugin and calls install()', () => {
    const registry = new PluginRegistry();
    const guardian = new Guardian();
    let installed = false;

    registry.install(
      createPlugin('test-plugin', () => {
        installed = true;
      }),
      guardian,
    );

    expect(installed).toBe(true);
    expect(registry.has('test-plugin')).toBe(true);
    expect(registry.getInstalled()).toEqual(['test-plugin']);
  });

  it('throws when the same plugin is installed twice', () => {
    const registry = new PluginRegistry();
    const guardian = new Guardian();
    const plugin = createPlugin('duplicate');

    registry.install(plugin, guardian);

    expect(() => registry.install(plugin, guardian)).toThrow(PluginAlreadyInstalledError);
    expect(() => registry.install(plugin, guardian)).toThrow(
      'Plugin "duplicate" is already installed',
    );
  });

  it('allows different plugins with different names', () => {
    const registry = new PluginRegistry();
    const guardian = new Guardian();

    registry.install(createPlugin('plugin-a'), guardian);
    registry.install(createPlugin('plugin-b'), guardian);

    expect(registry.getInstalled()).toEqual(['plugin-a', 'plugin-b']);
  });

  it('lets plugins register rules on the guardian', () => {
    const registry = new PluginRegistry();
    const guardian = new Guardian();

    registry.install(
      createPlugin('rules-plugin', (g) => {
        g.rule({ name: 'FromPlugin', when: () => true, score: 10 });
      }),
      guardian,
    );

    guardian.signal('x', 1);
    const report = guardian.analyze();
    expect(report.score).toBe(10);
    expect(report.matchedRules[0]?.name).toBe('FromPlugin');
  });

  it('throws PluginInstallError when install() fails and does not register plugin', () => {
    const registry = new PluginRegistry();
    const guardian = new Guardian();
    const plugin: Plugin = {
      name: 'broken-plugin',
      install(): void {
        throw new Error('install failed');
      },
    };

    expect(() => registry.install(plugin, guardian)).toThrow(PluginInstallError);
    expect(registry.has('broken-plugin')).toBe(false);
  });

  it('wraps non-Error install failures in PluginInstallError', () => {
    const registry = new PluginRegistry();
    const guardian = new Guardian();

    expect(() =>
      registry.install(
        {
          name: 'throws-string',
          install(): void {
            throw 'boom';
          },
        },
        guardian,
      ),
    ).toThrow('Plugin "throws-string" failed to install: Unknown plugin install error');
  });
});
