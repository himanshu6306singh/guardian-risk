# guardian-risk-express

> **Requires:** [`guardian-risk`](https://www.npmjs.com/package/guardian-risk) (core)

```bash
npm install guardian-risk guardian-risk-express
```

Express integration for [guardian-risk](https://www.npmjs.com/package/guardian-risk). Validates client IP, reads HTTP metadata, and provides production middleware.

## Signals

| Signal | Source |
|--------|--------|
| `clientIp` | Validated `req.ip` / `req.ips` (trust proxy aware) |
| `userAgent` | `User-Agent` header (truncated) |
| `requestMethod` | `req.method` |
| `requestPath` | `req.path` |

## Production usage

```typescript
import express from 'express';
import { Guardian } from 'guardian-risk';
import { expressPlugin, guardianMiddleware } from 'guardian-risk-express';
import { redisPlugin } from 'guardian-risk-redis';

const app = express();
app.set('trust proxy', 1); // required behind load balancers

const template = new Guardian()
  .use(expressPlugin({ trustProxy: true }))
  .use(redisPlugin({ url: process.env.REDIS_URL }))
  .rule({ name: 'HighRate', when: (s) => (s.requestsPerMinute ?? 0) > 120, score: 40 });

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use(
  guardianMiddleware(template, {
    blockAboveScore: 70,
    onAnalyzeError: 'block', // fail closed when hooks fail
    exposeBlockDetails: false, // never leak reasons to clients
  }),
);
```

## Security notes

- Set **`app.set('trust proxy', N)`** when behind a reverse proxy — otherwise `clientIp` reflects the proxy, not the user.
- **`clientIp` is validated** — malformed `X-Forwarded-For` values are rejected.
- Use **`onAnalyzeError: 'block'`** in production when `blockAboveScore` is set.
- Use **`template.fork()`** or `guardianMiddleware` — never share one `Guardian` across requests.
- Headers and user agents are **spoofable** — treat as hints, not proof.

## API

- `expressPlugin(options)` — registers `beforeAnalyze` hook
- `fromRequest(req, guardian, options)` — manual per-request signal injection
- `guardianMiddleware(template, options)` — Express middleware with optional blocking
- `analyzeRequest(template, req, options)` — programmatic analyze helper

See [SECURITY.md](../../SECURITY.md) and [MIGRATION.md](../../MIGRATION.md).
