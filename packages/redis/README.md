# guardian-risk-redis

> **Requires:** [`guardian-risk`](https://www.npmjs.com/package/guardian-risk) (core)

```bash
npm install guardian-risk guardian-risk-redis
# optional peer for real Redis:
npm install ioredis
```

Session and rate-limit signals backed by Redis (or in-memory for development).

## Signals

| Signal | Source |
|--------|--------|
| `sessionId` | Sanitized session header or `anonymous` |
| `requestsInWindow` | Atomic counter in sliding window |
| `requestsPerMinute` | Same as `requestsInWindow` (compat alias) |
| `loginAttempts` | Incremented via `recordLoginAttempt()` |
| `sessionAgeSeconds` | Age since session creation or window start |
| `signalSource` | Always `'session'` |

## Production usage

```typescript
import { Guardian } from 'guardian-risk';
import { redisPlugin, recordLoginAttempt } from 'guardian-risk-redis';

const template = new Guardian().use(
  redisPlugin({
    url: process.env.REDIS_URL,
    keyPrefix: 'myapp:risk:',
    sessionIdHeader: 'x-session-id',
    allowInMemoryFallback: false, // default — fail loud if Redis unavailable
    rateLimitByIpWhenNoSession: true,
  }),
);

// On failed login:
await recordLoginAttempt(sessionId, store);
```

## Security notes

- **`x-session-id` is client-supplied** — bind it to your server session in production.
- Session IDs are **sanitized** (length + charset); invalid IDs are ignored.
- When no session is present, rate limiting falls back to **validated `clientIp`** (from express plugin).
- **`allowInMemoryFallback` defaults to `false`** — `createRedisStore()` throws if `ioredis` is missing.
- Do not use in-memory store in multi-instance deployments.

## API

- `redisPlugin(options)` — `beforeAnalyze` hook
- `loadSessionSignals(sessionId, guardian, options)` — manual preload
- `recordLoginAttempt(sessionId, store?)` — increment login counter
- `createRedisStore({ url, keyPrefix, allowInMemoryFallback })` — standalone store

See [SECURITY.md](../../SECURITY.md).
