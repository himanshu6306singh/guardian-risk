import { describe, it, expect } from 'vitest';
import { Guardian } from 'guardian-risk';
import { loadSessionSignals, InMemorySessionStore } from './index.js';

describe('loadSessionSignals', () => {
  it('tracks requests per session window', async () => {
    const store = new InMemorySessionStore();
    const guardian = new Guardian();

    await loadSessionSignals('sess-1', guardian, { store, windowMs: 60_000 });
    await loadSessionSignals('sess-1', guardian, { store, windowMs: 60_000 });

    guardian.rule({
      name: 'Burst',
      when: (s) => (s.requestsPerMinute as number) >= 2,
      score: 25,
    });

    const report = guardian.analyze();
    expect(report.score).toBe(25);
  });
});
