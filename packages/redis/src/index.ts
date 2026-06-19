import type { Plugin } from 'guardian-risk';
import { parseIpAddress, sanitizeSessionId } from 'guardian-risk';
import {
  defaultSessionStore,
  InMemorySessionStore,
  type SessionStore,
  type SessionSnapshot,
} from './sessionStore.js';
import { createRedisStore, RedisSessionStore } from './redisStore.js';

/** Options for the Redis / session plugin. */
export interface RedisPluginOptions {
  readonly url?: string;
  readonly keyPrefix?: string;
  readonly windowMs?: number;
  readonly sessionIdHeader?: string;
  readonly store?: SessionStore;
  /** Rate-limit by validated client IP when no session ID is present (default: true). */
  readonly rateLimitByIpWhenNoSession?: boolean;
  /** Only used with `url` — default false (fail loud in production). */
  readonly allowInMemoryFallback?: boolean;
}

const DEFAULT_WINDOW_MS = 60_000;
const storePromises = new Map<string, Promise<SessionStore>>();

export function redisPlugin(options: RedisPluginOptions = {}): Plugin {
  const {
    windowMs = DEFAULT_WINDOW_MS,
    sessionIdHeader = 'x-session-id',
    keyPrefix = 'guardian:',
    url,
    store: providedStore,
    rateLimitByIpWhenNoSession = true,
    allowInMemoryFallback = false,
  } = options;

  return {
    name: 'guardian-risk-redis',
    install(guardian) {
      guardian.beforeAnalyze(async ({ data, guardian: g }) => {
        const sessionId = resolveSessionId(data, sessionIdHeader);
        const store = await resolvePluginStore({
          providedStore,
          url,
          keyPrefix,
          allowInMemoryFallback,
        });

        if (sessionId) {
          await applySessionSignals(sessionId, g, store, windowMs);
          return;
        }

        if (rateLimitByIpWhenNoSession) {
          const ip = readValidatedClientIp(g, data);
          if (ip) {
            await applySessionSignals(`ip:${ip}`, g, store, windowMs);
          }
        }
      });
    },
  };
}

export interface SessionContext {
  readonly sessionId: string;
  readonly sessionCreatedAt?: number;
}

export async function loadSessionSignals(
  sessionId: string,
  guardian: import('guardian-risk').Guardian,
  options: RedisPluginOptions & { sessionCreatedAt?: number } = {},
): Promise<import('guardian-risk').Guardian> {
  const sanitized = sanitizeSessionId(sessionId);
  if (!sanitized) {
    throw new TypeError('Invalid session ID');
  }

  const store = await resolvePluginStore({
    providedStore: options.store,
    url: options.url,
    keyPrefix: options.keyPrefix ?? 'guardian:',
    allowInMemoryFallback: options.allowInMemoryFallback ?? false,
  });

  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  await applySessionSignals(sanitized, guardian, store, windowMs, options.sessionCreatedAt);
  return guardian;
}

export async function recordLoginAttempt(
  sessionId: string,
  store: SessionStore = defaultSessionStore,
): Promise<number> {
  const sanitized = sanitizeSessionId(sessionId);
  if (!sanitized) {
    throw new TypeError('Invalid session ID');
  }
  return store.incrementLoginAttempts(sanitized);
}

async function applySessionSignals(
  counterKey: string,
  guardian: import('guardian-risk').Guardian,
  store: SessionStore,
  windowMs: number,
  sessionCreatedAt?: number,
): Promise<void> {
  const snapshot = await store.incrementRequests(counterKey, windowMs);
  const sessionAgeSeconds = sessionCreatedAt
    ? Math.max(0, Math.floor((Date.now() - sessionCreatedAt) / 1000))
    : Math.max(0, Math.floor((Date.now() - snapshot.windowStartedAt) / 1000));

  guardian
    .signal('sessionId', counterKey.startsWith('ip:') ? 'anonymous' : counterKey)
    .signal('requestsInWindow', snapshot.requestsInWindow)
    .signal('requestsPerMinute', snapshot.requestsInWindow)
    .signal('loginAttempts', snapshot.loginAttempts)
    .signal('sessionAgeSeconds', sessionAgeSeconds)
    .signal('signalSource', 'session');
}

function resolveSessionId(data: unknown, headerName: string): string | undefined {
  if (data !== null && typeof data === 'object' && 'sessionId' in data) {
    const value = (data as SessionContext).sessionId;
    if (typeof value === 'string') {
      return sanitizeSessionId(value) ?? undefined;
    }
  }

  if (data !== null && typeof data === 'object' && 'headers' in data) {
    const headers = (data as { headers: Record<string, string | string[] | undefined> }).headers;
    const raw = headers[headerName] ?? headers[headerName.toLowerCase()];
    const candidate = Array.isArray(raw) ? raw[0] : raw;
    if (typeof candidate === 'string') {
      return sanitizeSessionId(candidate) ?? undefined;
    }
  }

  return undefined;
}

function readValidatedClientIp(
  guardian: import('guardian-risk').Guardian,
  data: unknown,
): string | null {
  const fromSignal = guardian.getSignal('clientIp');
  if (typeof fromSignal === 'string') {
    const parsed = parseIpAddress(fromSignal);
    if (parsed) {
      return parsed;
    }
  }

  if (data !== null && typeof data === 'object' && 'ip' in data) {
    const ip = (data as { ip?: string }).ip;
    if (typeof ip === 'string') {
      return parseIpAddress(ip);
    }
  }

  return null;
}

async function resolvePluginStore(options: {
  providedStore?: SessionStore | undefined;
  url?: string | undefined;
  keyPrefix: string;
  allowInMemoryFallback: boolean;
}): Promise<SessionStore> {
  if (options.providedStore) {
    return options.providedStore;
  }
  if (options.url) {
    const cacheKey = `${options.url}::${options.keyPrefix}`;
    if (!storePromises.has(cacheKey)) {
      storePromises.set(
        cacheKey,
        createRedisStore({
          url: options.url,
          keyPrefix: options.keyPrefix,
          allowInMemoryFallback: options.allowInMemoryFallback,
        }),
      );
    }
    return storePromises.get(cacheKey)!;
  }
  return defaultSessionStore;
}

export { defaultSessionStore, InMemorySessionStore };
export { createRedisStore, RedisSessionStore };
export type { SessionStore, SessionSnapshot };
export type { RedisClientLike, CreateRedisStoreOptions } from './redisStore.js';
