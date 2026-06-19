/** In-memory session counter store (single-node). Swap for Redis in production. */
export interface SessionSnapshot {
  readonly requestsInWindow: number;
  readonly windowStartedAt: number;
  readonly loginAttempts: number;
}

export interface SessionStore {
  incrementRequests(sessionId: string, windowMs: number): Promise<SessionSnapshot>;
  incrementLoginAttempts(sessionId: string): Promise<number>;
  getLoginAttempts(sessionId: string): Promise<number>;
}

export class InMemorySessionStore implements SessionStore {
  private readonly requests = new Map<string, { count: number; windowStart: number }>();
  private readonly logins = new Map<string, number>();
  private readonly maxEntries: number;

  constructor(maxEntries = 10_000) {
    this.maxEntries = maxEntries;
  }

  async incrementRequests(sessionId: string, windowMs: number): Promise<SessionSnapshot> {
    this.evictIfNeeded(this.requests);
    const now = Date.now();
    let entry = this.requests.get(sessionId);

    if (!entry || now - entry.windowStart > windowMs) {
      entry = { count: 0, windowStart: now };
    }

    entry.count += 1;
    this.requests.set(sessionId, entry);

    return {
      requestsInWindow: entry.count,
      windowStartedAt: entry.windowStart,
      loginAttempts: this.logins.get(sessionId) ?? 0,
    };
  }

  async incrementLoginAttempts(sessionId: string): Promise<number> {
    const next = (this.logins.get(sessionId) ?? 0) + 1;
    this.logins.set(sessionId, next);
    return next;
  }

  async getLoginAttempts(sessionId: string): Promise<number> {
    return this.logins.get(sessionId) ?? 0;
  }

  private evictIfNeeded(map: Map<string, unknown>): void {
    if (map.size < this.maxEntries) {
      return;
    }
    const firstKey = map.keys().next().value as string | undefined;
    if (firstKey) {
      map.delete(firstKey);
    }
  }
}

/** Shared default store for single-process apps and tests. */
export const defaultSessionStore = new InMemorySessionStore();
