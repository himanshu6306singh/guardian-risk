import type { Plugin } from 'guardian-risk';
import { BrowserCollector, type BrowserCollectorOptions } from './collector.js';

export type { BrowserSignalSnapshot, BrowserCollectorOptions } from './collector.js';
export { BrowserCollector, computeMouseLinearity } from './collector.js';

/** Options for the browser plugin. */
export interface BrowserPluginOptions extends BrowserCollectorOptions {
  /** Auto-start collection on install (browser only). */
  readonly autoStart?: boolean;
}

/**
 * Browser plugin — behavioral rules with a capped `behavior` group.
 * Use {@link createBrowserCollector} to collect signals before analyze.
 */
export function browserPlugin(options: BrowserPluginOptions = {}): Plugin {
  const { autoStart = false, ...collectorOptions } = options;

  return {
    name: 'guardian-risk-browser',
    install(guardian) {
      guardian.ruleGroup({
        name: 'behavior',
        maxScore: 50,
        rules: [
          {
            name: 'LinearMouse',
            reason: 'Mouse movement is unnaturally linear',
            when: (s) => (s.mouseLinearity as number) > 0.92,
            score: 25,
          },
          {
            name: 'NoMouseActivity',
            reason: 'No pointer or mouse activity detected before submit',
            when: (s) =>
              (s.mouseSampleCount as number) === 0 && s.hasPointerActivity !== true,
            score: 20,
          },
          {
            name: 'RoboticClicks',
            reason: 'Click timing is unnaturally regular',
            when: (s) => {
              const interval = s.avgClickIntervalMs as number;
              const count = s.clickCount as number;
              return count >= 3 && interval > 0 && interval < 50;
            },
            score: 30,
          },
        ],
      });

      if (autoStart && typeof document !== 'undefined') {
        const collector = new BrowserCollector(collectorOptions);
        const stop = collector.start();
        guardian.beforeAnalyze(({ guardian: g }) => {
          collector.applyTo(g);
          stop();
        });
      }
    },
  };
}

/**
 * Create a browser signal collector. Call `start()`, then `applyTo(guardian)` before analyze.
 */
export function createBrowserCollector(
  options: BrowserCollectorOptions = {},
): BrowserCollector {
  return new BrowserCollector(options);
}

/**
 * Collect signals then apply to Guardian. Optional `durationMs` to wait before sampling.
 */
export function collectSignals(
  guardian: import('guardian-risk').Guardian,
  options: BrowserCollectorOptions & { durationMs?: number } = {},
): Promise<import('guardian-risk').Guardian> {
  const { durationMs = 0, ...collectorOptions } = options;
  const collector = new BrowserCollector(collectorOptions);
  const stop = collector.start();

  const finish = (): import('guardian-risk').Guardian => {
    stop();
    return collector.applyTo(guardian);
  };

  if (durationMs <= 0) {
    return Promise.resolve(finish());
  }

  return new Promise((resolve) => {
    setTimeout(() => resolve(finish()), durationMs);
  });
}
