# guardian-risk-redis

> **Requires:** [`guardian-risk`](https://www.npmjs.com/package/guardian-risk) (core)

```bash
npm install guardian-risk guardian-risk-redis
```

> **Stub package** — API may change before `1.0.0`.

Redis integration for [guardian-risk](https://www.npmjs.com/package/guardian-risk). Stores events and exposes session-based counters as signals.

## Planned signals

| Signal | Source |
|--------|--------|
| `requestsPerMinute` | Sliding window counter |
| `sessionAge` | First-seen timestamp |
| `failedLoginCount` | Incremented on auth failures |
| `uniqueIpsPerSession` | HyperLogLog or set cardinality |

## Usage (stub)

```typescript
import { Guardian } from 'guardian-risk';
import { redisPlugin, loadSessionSignals } from 'guardian-risk-redis';

const guardian = new Guardian().use(
  redisPlugin({ url: process.env.REDIS_URL, keyPrefix: 'app:risk:' }),
);

await loadSessionSignals('session-123', guardian);
const report = guardian.analyze();
```

## Status

Not yet published. Implementation in progress.
