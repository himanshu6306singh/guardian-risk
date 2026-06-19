# guardian-risk-browser

> **Requires:** [`guardian-risk`](https://www.npmjs.com/package/guardian-risk) (core)

```bash
npm install guardian-risk guardian-risk-browser
```

Browser-side behavioral signal collection for [guardian-risk](https://www.npmjs.com/package/guardian-risk).

## Signals

| Signal | Source |
|--------|--------|
| `mouseLinearity` | Pointer movement linearity (0–1) |
| `hasPointerActivity` | Mouse or touch activity detected |
| `keystrokeCount` | Key events in sample window |
| `headlessUA` | User-agent heuristics |

## Usage

```typescript
import { Guardian } from 'guardian-risk';
import { browserPlugin, BrowserCollector } from 'guardian-risk-browser';

const guardian = new Guardian().use(browserPlugin());

const collector = new BrowserCollector();
const stop = collector.start();
// ... user interacts ...
collector.applyTo(guardian);
stop();
```

## Security notes

- **All browser signals are client-controlled** — attackers can spoof or omit them.
- Use for **defense in depth** only; never as sole auth or blocking factor.
- Pair with server-side signals (IP rate limits, session age, VPN checks).
- Mobile users: `hasPointerActivity` includes touch events.

## API

- `browserPlugin()` — registers default behavioral rules
- `BrowserCollector` — tracks pointer/keyboard activity
- `collectSignals(guardian, options?)` — timed sampling helper
- `computeMouseLinearity(points)` — standalone metric

See [SECURITY.md](../../SECURITY.md).
