import { describe, it, expect } from 'vitest';
import { RedisSessionStore, type RedisClientLike } from './redisStore.js';

function createMockClient(state = new Map<string, string>()): RedisClientLike {
  const counters = new Map<string, number>();

  return {
    async incr(key: string): Promise<number> {
      const next = (counters.get(key) ?? 0) + 1;
      counters.set(key, next);
      return next;
    },
    async expire(): Promise<number> {
      return 1;
    },
    async get(key: string): Promise<string | null> {
      return state.get(key) ?? null;
    },
    async set(key: string, value: string): Promise<void> {
      state.set(key, value);
    },
    async quit(): Promise<void> {},
  };
}

describe('RedisSessionStore', () => {
  it('increments request counters per session', async () => {
    const store = new RedisSessionStore(createMockClient(), 'g:');
    const first = await store.incrementRequests('abc', 60_000);
    const second = await store.incrementRequests('abc', 60_000);

    expect(first.requestsInWindow).toBe(1);
    expect(second.requestsInWindow).toBe(2);
  });
});
