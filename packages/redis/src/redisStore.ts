import type { SessionSnapshot, SessionStore } from './sessionStore.js';

/** Minimal Redis client surface used by Guardian. */
export interface RedisClientLike {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<unknown>;
  quit(): Promise<unknown>;
}

export interface CreateRedisStoreOptions {
  readonly url: string;
  readonly keyPrefix?: string;
  /**
   * When true, falls back to in-memory if ioredis is unavailable.
   * Default: false (throws on failure — recommended for production).
   */
  readonly allowInMemoryFallback?: boolean;
}

/**
 * Redis-backed session store with atomic windowed counters.
 */
export class RedisSessionStore implements SessionStore {
  constructor(
    private readonly client: RedisClientLike,
    private readonly keyPrefix: string,
  ) {}

  async incrementRequests(sessionId: string, windowMs: number): Promise<SessionSnapshot> {
    const windowSlot = Math.floor(Date.now() / windowMs);
    const requestKey = `${this.keyPrefix}req:${sessionId}:${windowSlot}`;
    const loginKey = `${this.keyPrefix}login:${sessionId}`;
    const ttlSeconds = Math.max(1, Math.ceil(windowMs / 1000) + 1);

    const count = await this.client.incr(requestKey);
    await this.client.expire(requestKey, ttlSeconds);

    return {
      requestsInWindow: count,
      windowStartedAt: windowSlot * windowMs,
      loginAttempts: await this.readLoginAttempts(loginKey),
    };
  }

  async incrementLoginAttempts(sessionId: string): Promise<number> {
    const loginKey = `${this.keyPrefix}login:${sessionId}`;
    return this.client.incr(loginKey);
  }

  async getLoginAttempts(sessionId: string): Promise<number> {
    return this.readLoginAttempts(`${this.keyPrefix}login:${sessionId}`);
  }

  private async readLoginAttempts(loginKey: string): Promise<number> {
    const raw = await this.client.get(loginKey);
    return raw ? Number(raw) : 0;
  }
}

/**
 * Create a Redis session store.
 * @throws When ioredis is unavailable and `allowInMemoryFallback` is false.
 */
export async function createRedisStore(
  urlOrOptions: string | CreateRedisStoreOptions,
  legacyKeyPrefix = 'guardian:',
): Promise<SessionStore> {
  const options: CreateRedisStoreOptions =
    typeof urlOrOptions === 'string'
      ? { url: urlOrOptions, keyPrefix: legacyKeyPrefix }
      : urlOrOptions;

  const { url, keyPrefix = 'guardian:', allowInMemoryFallback = false } = options;
  const { InMemorySessionStore } = await import('./sessionStore.js');

  try {
    const module = (await import('ioredis')) as {
      default: new (url: string) => RedisClientLike;
    };
    const client = new module.default(url);
    return new RedisSessionStore(client, keyPrefix);
  } catch (error) {
    if (allowInMemoryFallback) {
      return new InMemorySessionStore();
    }
    const message = error instanceof Error ? error.message : 'unknown error';
    throw new Error(
      `Failed to connect Redis store. Install ioredis or set allowInMemoryFallback: true. ${message}`,
    );
  }
}
