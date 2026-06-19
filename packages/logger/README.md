# guardian-risk-logger

> **Requires:** [`guardian-risk`](https://www.npmjs.com/package/guardian-risk) (core)

```bash
npm install guardian-risk guardian-risk-logger
```

Audit logging for [guardian-risk](https://www.npmjs.com/package/guardian-risk) analysis results.

## What gets logged

| Field | Source |
|-------|--------|
| `score` | `report.score` |
| `riskLevel` | `report.level` |
| `matchedRules` | Rule names from `report.matchedRules` |
| `reasons` | `report.reasons` |
| `context` | Sanitized request metadata (method, path, IP only) |

## Production usage

```typescript
import { Guardian } from 'guardian-risk';
import { loggerPlugin } from 'guardian-risk-logger';

const template = new Guardian()
  .use(loggerPlugin({ level: 'info', minScore: 20 }))
  .rule({ name: 'Bot', when: (s) => s.headlessUA === true, score: 30 });

// Middleware runs analyzeAsync → afterAnalyze logs automatically
```

## Security notes

- Request **headers are redacted** from log context — only method, path, and validated IP are kept.
- Do not log raw cookies, auth tokens, or PII in custom sinks.
- Use `minScore` to reduce noise in high-traffic apps.

## API

- `loggerPlugin(options)` — `afterAnalyze` auto-logging
- `analyzeAndLog(guardian, options)` — one-shot analyze + log
- `logReport(report, options)` — log an existing report
- `LogSink` — custom destination (Datadog, CloudWatch, etc.)

See [SECURITY.md](../../SECURITY.md).
