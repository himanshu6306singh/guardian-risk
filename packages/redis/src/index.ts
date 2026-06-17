import type { Plugin } from 'guardian-risk';

/** Options for the Redis plugin (stub). */
export interface RedisPluginOptions {
  /** Redis connection URL. */
  readonly url?: string;
  /** Key prefix for Guardian counters. */
  readonly keyPrefix?: string;
}

/**
 * Redis plugin for guardian-risk.
 *
 * @stub Future versions will read/write session counters in Redis and
 * expose signals like `requestsPerMinute` and `sessionAge`.
 */
export function redisPlugin(options: RedisPluginOptions = {}): Plugin {
  const { url = 'redis://localhost:6379', keyPrefix = 'guardian:' } = options;

  return {
    name: 'guardian-risk-redis',
    install(_guardian) {
      void url;
      void keyPrefix;
      // Stub: will connect to Redis and sync counters into signals
    },
  };
}

/**
 * @stub Future helper to load session counters from Redis into signals.
 */
export async function loadSessionSignals(
  _sessionId: string,
  guardian: import('guardian-risk').Guardian,
): Promise<import('guardian-risk').Guardian> {
  return guardian
    .signal('signalSource', 'redis')
    .signal('redisPlugin', 'stub');
}
