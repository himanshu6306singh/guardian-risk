# guardian-risk-express

> **Requires:** [`guardian-risk`](https://www.npmjs.com/package/guardian-risk) (core)

```bash
npm install guardian-risk guardian-risk-express
```

> **Stub package** — API may change before `1.0.0`.

Express integration for [guardian-risk](https://www.npmjs.com/package/guardian-risk). Reads HTTP request data and adds risk signals.

## Planned signals

| Signal | Source |
|--------|--------|
| `clientIp` | `req.ip` / forwarded headers |
| `userAgent` | `User-Agent` header |
| `requestMethod` | `req.method` |
| `requestsPerMinute` | Rate counter (with Redis plugin) |

## Usage (stub)

```typescript
import { Guardian } from 'guardian-risk';
import { expressPlugin, fromRequest } from 'guardian-risk-express';

const guardian = new Guardian().use(expressPlugin({ trustProxy: true }));

// Future: per-request signal injection
// app.use((req, res, next) => {
//   fromRequest(req, guardian);
//   next();
// });
```

## Status

Not yet published. Implementation in progress.
