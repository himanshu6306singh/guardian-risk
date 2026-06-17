# guardian-risk-logger

> **Requires:** [`guardian-risk`](https://www.npmjs.com/package/guardian-risk) (core)

```bash
npm install guardian-risk guardian-risk-logger
```

> **Stub package** — API may change before `1.0.0`.

Audit logging for [guardian-risk](https://www.npmjs.com/package/guardian-risk). Records risk reports, matched rules, and scores for compliance and debugging.

## What gets logged

| Field | Source |
|-------|--------|
| `score` | `report.score` |
| `riskLevel` | `report.level` |
| `matchedRules` | Count and details from `report.matchedRules` |
| `reasons` | `report.reasons` |
| `analyzedAt` | `report.analyzedAt` |

## Usage (stub)

```typescript
import { Guardian } from 'guardian-risk';
import { loggerPlugin, analyzeAndLog } from 'guardian-risk-logger';
import { vpnPlugin } from 'guardian-risk-vpn';

const guardian = new Guardian()
  .use(loggerPlugin({ level: 'info', minScore: 20 }))
  .use(vpnPlugin());

guardian.signal('vpn', true);

const report = analyzeAndLog(guardian, { minScore: 0 });
```

## Custom sink

```typescript
import { loggerPlugin, logReport, type LogSink } from 'guardian-risk-logger';

const sink: LogSink = {
  write(entry) {
    // Send to Datadog, CloudWatch, file, etc.
    myAuditService.record(entry);
  },
};

const guardian = new Guardian().use(loggerPlugin({ sink }));
const report = guardian.analyze();
logReport(report, { sink });
```

## Status

Not yet published. Implementation in progress.
