# guardian-risk-browser

> **Requires:** [`guardian-risk`](https://www.npmjs.com/package/guardian-risk) (core)

```bash
npm install guardian-risk guardian-risk-browser
```

> **Stub package** — API may change before `1.0.0`.

Browser integration for [guardian-risk](https://www.npmjs.com/package/guardian-risk). Collects client-side behavioral and fingerprint signals.

## Planned signals

| Signal | Source |
|--------|--------|
| `mouseLinearity` | Mouse movement patterns |
| `keystrokeInterval` | Typing rhythm |
| `headlessUA` | User agent heuristics |
| `canvasFingerprint` | Canvas hash |

## Usage (stub)

```typescript
import { Guardian } from 'guardian-risk';
import { browserPlugin, collectSignals } from 'guardian-risk-browser';

const guardian = new Guardian().use(browserPlugin());

collectSignals(guardian);
const report = guardian.analyze();
```

## Status

Not yet published. Implementation in progress.
