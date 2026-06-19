import { describe, it, expect, vi } from 'vitest';
import { Guardian } from './Guardian.js';
import { DEFAULT_RISK_LEVELS } from '../constants/defaults.js';
import { PluginAlreadyInstalledError } from '../plugins/PluginRegistry.js';
import type { Plugin } from '../plugins/Plugin.js';

describe('Guardian', () => {
  it('provides fluent API for signals, rules, and analysis', () => {
    const guardian = new Guardian();

    const report = guardian
      .signal('postsPerMinute', 50)
      .signal('emailVerified', false)
      .rule({
        name: 'HighPosting',
        when: (s) => (s.postsPerMinute as number) > 20,
        score: 20,
      })
      .rule({
        name: 'UnverifiedEmail',
        when: (s) => s.emailVerified === false,
        score: 15,
      })
      .analyze();

    expect(report.score).toBe(35);
    expect(report.level).toBe('MEDIUM');
    expect(report.reasons).toEqual(['HighPosting', 'UnverifiedEmail']);
    expect(report.matchedRules).toHaveLength(2);
    expect(Object.isFrozen(report)).toBe(true);
  });

  it('uses default risk levels when none configured', () => {
    const guardian = new Guardian();
    guardian
      .signal('risk', true)
      .rule({ name: 'HighRisk', when: () => true, score: 75 });

    const report = guardian.analyze();
    expect(report.level).toBe('CRITICAL');
  });

  it('accepts custom risk level thresholds', () => {
    const guardian = new Guardian({
      levels: [
        { max: 10, level: 'SAFE' },
        { max: Infinity, level: 'DANGER' },
      ],
    });

    guardian
      .signal('x', 1)
      .rule({ name: 'R', when: () => true, score: 25 });

    const report = guardian.analyze();
    expect(report.level).toBe('DANGER');
  });

  it('clears signals on reset but keeps rules', () => {
    const guardian = new Guardian();
    guardian
      .signal('postsPerMinute', 50)
      .rule({
        name: 'HighPosting',
        when: (s) => (s.postsPerMinute as number) > 20,
        score: 20,
      });

    const first = guardian.analyze();
    expect(first.score).toBe(20);

    guardian.reset();
    const second = guardian.analyze();
    expect(second.score).toBe(0);
    expect(second.matchedRules).toHaveLength(0);
  });

  it('returns LOW level for zero score with default thresholds', () => {
    const guardian = new Guardian();
    const report = guardian.analyze();
    expect(report.score).toBe(0);
    expect(report.level).toBe('LOW');
  });

  it('exposes default risk levels constant', () => {
    expect(DEFAULT_RISK_LEVELS).toHaveLength(4);
    expect(DEFAULT_RISK_LEVELS[0]?.level).toBe('LOW');
  });

  it('installs plugins via use()', () => {
    const plugin: Plugin = {
      name: 'test-plugin',
      install(guardian) {
        guardian
          .rule({ name: 'PluginRule', when: () => true, score: 5 })
          .signal('fromPlugin', true);
      },
    };

    const guardian = new Guardian().use(plugin);

    expect(guardian.getInstalledPlugins()).toEqual(['test-plugin']);

    const report = guardian.analyze();
    expect(report.score).toBe(5);
  });

  it('throws when installing the same plugin twice', () => {
    const plugin: Plugin = {
      name: 'duplicate',
      install() {},
    };

    const guardian = new Guardian().use(plugin);

    expect(() => guardian.use(plugin)).toThrow(PluginAlreadyInstalledError);
  });

  it('rejects invalid custom risk levels', () => {
    expect(() => new Guardian({ levels: [] })).toThrow(TypeError);
  });

  it('keeps installed plugins after reset()', () => {
    const plugin: Plugin = {
      name: 'persistent-plugin',
      install(guardian) {
        guardian.rule({ name: 'Persistent', when: () => true, score: 10 });
      },
    };

    const guardian = new Guardian().use(plugin);
    guardian.signal('x', 1).analyze();
    guardian.reset();

    expect(guardian.getInstalledPlugins()).toEqual(['persistent-plugin']);
    expect(guardian.analyze().score).toBe(10);
  });

  it('runs beforeAnalyze hooks in analyzeAsync', async () => {
    const guardian = new Guardian().beforeAnalyze(({ guardian: g, data }) => {
      g.signal('fromHook', data as string);
    });

    guardian.rule({
      name: 'HookSignal',
      when: (s) => s.fromHook === 'ctx',
      score: 12,
    });

    const report = await guardian.analyzeAsync('ctx');
    expect(report.score).toBe(12);
  });

  it('runs afterAnalyze hooks in analyzeAsync', async () => {
    const after = vi.fn();

    const guardian = new Guardian()
      .rule({ name: 'Always', when: () => true, score: 5 })
      .afterAnalyze(after);

    const report = await guardian.analyzeAsync();
    expect(report.score).toBe(5);
    expect(after).toHaveBeenCalledWith(
      expect.objectContaining({ report: expect.objectContaining({ score: 5 }) }),
    );
  });

  it('throws on analyze() when hooks are registered', () => {
    const guardian = new Guardian().beforeAnalyze(() => {});

    expect(() => guardian.analyze()).toThrow(/analyzeAsync/);
  });

  it('fork creates isolated signal stores for concurrent requests', async () => {
    const template = new Guardian()
      .rule({
        name: 'HighBurst',
        when: (s) => (s.requestsPerMinute as number) > 10,
        score: 30,
      });

    const [a, b] = await Promise.all([
      (async () => {
        const g = template.fork();
        g.signal('requestsPerMinute', 50);
        return g.analyzeAsync();
      })(),
      (async () => {
        const g = template.fork();
        g.signal('requestsPerMinute', 1);
        return g.analyzeAsync();
      })(),
    ]);

    expect(a.score).toBe(30);
    expect(b.score).toBe(0);
  });

  it('fork copies plugins and hooks', async () => {
    const plugin: Plugin = {
      name: 'fork-plugin',
      install(guardian) {
        guardian.rule({ name: 'FromPlugin', when: () => true, score: 7 });
      },
    };

    const template = new Guardian()
      .use(plugin)
      .beforeAnalyze(({ guardian: g }) => {
        g.signal('enriched', true);
      })
      .rule({ name: 'NeedsEnrichment', when: (s) => s.enriched === true, score: 3 });

    const child = template.fork();
    const report = await child.analyzeAsync();

    expect(child.getInstalledPlugins()).toEqual(['fork-plugin']);
    expect(report.score).toBe(10);
  });

  it('prevents rule registration during analyzeAsync', async () => {
    const guardian = new Guardian().beforeAnalyze(({ guardian: g }) => {
      expect(() => g.rule({ name: 'Late', when: () => true, score: 1 })).toThrow(
        /analysis is in progress/,
      );
    });

    await guardian.analyzeAsync();
  });

  it('reads signals via getSignal', () => {
    const guardian = new Guardian().signal('clientIp', '203.0.113.10');
    expect(guardian.getSignal('clientIp')).toBe('203.0.113.10');
    expect(guardian.getSignal('missing')).toBeUndefined();
  });

  it('fork copies group caps and after hooks', async () => {
    const afterSpy = vi.fn();
    const parent = new Guardian()
      .ruleGroup({
        name: 'login',
        maxScore: 30,
        rules: [{ name: 'A', when: () => true, score: 50 }],
      })
      .afterAnalyze(afterSpy);

    const child = parent.fork();
    const report = await child.analyzeAsync();

    expect(report.score).toBe(30);
    expect(afterSpy).toHaveBeenCalledTimes(1);
  });
});
