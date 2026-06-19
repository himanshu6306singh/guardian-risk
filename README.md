# Guardian

**A configurable risk decision engine for TypeScript.**

Guardian helps developers answer one question:

> Based on my application's rules, how risky is this action?

It is **not** a bot detection library. It is a composable engine — like Zod validates data and Prisma manages databases, Guardian evaluates risk.

## Use cases

- Bot detection
- Spam detection
- Fraud detection
- Login risk
- Payment risk
- User trust score
- Account health
- Internal security

## Install

```bash
pnpm add guardian-risk
```

> **npm package name:** `guardian-risk`

## Quick start

```typescript
import { Guardian } from 'guardian-risk';

const guardian = new Guardian();

guardian
  .signal('postsPerMinute', 50)
  .signal('emailVerified', false)
  .rule({
    name: 'HighPosting',
    when: (s) => (s.postsPerMinute as number) > 20,
    score: 20,
  })
  .rule({
    name: 'UnverifiedEmail',
    when: (s) => s.emailVerified === false,
    score: 15,
  });

const report = guardian.analyze();
// { score: 35, level: 'MEDIUM', reasons: [...], matchedRules: [...] }
```

## Core concepts

| Concept | Description |
|---------|-------------|
| **Signals** | Input values (e.g. `emailVerified`, `postsPerMinute`) |
| **Rules** | Conditions that add risk when matched |
| **Engine** | Runs every rule against signals |
| **Report** | Score, level, reasons, and matched rules |
| **Plugins** | Extend Guardian with signals, rules, or integrations |

## Plugin system (v0.2)

Plugins extend Guardian **without modifying core**. Each plugin implements:

```typescript
interface Plugin {
  name: string;
  install(guardian: Guardian): void;
}
```

Register with the fluent API:

```typescript
import { Guardian } from 'guardian-risk';
import { expressPlugin } from 'guardian-risk-express';

const guardian = new Guardian()
  .use(expressPlugin({ trustProxy: true }))
  .signal('loginAttempts', 5)
  .rule({
    name: 'BruteForce',
    when: (s) => (s.loginAttempts as number) > 3,
    score: 40,
  });

guardian.getInstalledPlugins(); // ['guardian-risk-express']
```

### Plugin rules

- Each plugin `name` can only be installed **once** per `Guardian` instance
- Plugins may call `guardian.signal()`, `guardian.rule()`, and lifecycle hooks inside `install()`
- Use `guardian.fork()` per HTTP request for safe concurrency
- `guardian.analyzeAsync(req)` runs `beforeAnalyze` hooks (Express, Redis, VPN)
- Plugins **never** change core engine logic
- `guardian.reset()` clears signals only — rules and plugins persist

### Official plugins (stubs)

| Package | Status | Purpose |
|---------|--------|---------|
| [`guardian-risk`](packages/core) | Published | Core engine |
| [`guardian-risk-express`](packages/express) | Stub | Express request signals |
| [`guardian-risk-browser`](packages/browser) | Stub | Mouse, keyboard, fingerprint |
| [`guardian-risk-redis`](packages/redis) | Stub | Session counters, rate limits |
| [`guardian-risk-vpn`](packages/vpn) | Stub | VPN, proxy, Tor detection |
| [`guardian-risk-logger`](packages/logger) | Stub | Audit logs for reports |

### Plugin stack example

```typescript
import { Guardian } from 'guardian-risk';
import { expressPlugin } from 'guardian-risk-express';
import { vpnPlugin, checkIp } from 'guardian-risk-vpn';
import { loggerPlugin, analyzeAndLog } from 'guardian-risk-logger';

const guardian = new Guardian()
  .use(expressPlugin({ trustProxy: true }))
  .use(vpnPlugin({ vpnScore: 20 }))
  .use(loggerPlugin({ level: 'info', minScore: 0 }));

await checkIp('203.0.113.10', guardian);
const report = analyzeAndLog(guardian);
```

### Custom plugin example

```typescript
import type { Plugin } from 'guardian-risk';

const customPlugin: Plugin = {
  name: 'my-custom-checks',
  install(guardian) {
    guardian.rule({
      name: 'HighValueTransfer',
      when: (s) => (s.amount as number) > 10_000,
      score: 50,
      reason: 'Transfer exceeds daily limit threshold',
    });
  },
};

new Guardian().use(customPlugin);
```

## Scoring

Score is the **sum of all matched rule scores**. Risk levels are configurable:

| Score | Default level |
|-------|---------------|
| 0–20 | LOW |
| 21–40 | MEDIUM |
| 41–60 | HIGH |
| 61+ | CRITICAL |

```typescript
const guardian = new Guardian({
  levels: [
    { max: 20, level: 'LOW' },
    { max: 40, level: 'MEDIUM' },
    { max: 60, level: 'HIGH' },
    { max: Infinity, level: 'CRITICAL' },
  ],
});
```

## Monorepo structure

```
guardian/
├── packages/
│   ├── core/       → guardian-risk (npm)
│   ├── express/    → guardian-risk-express (stub)
│   ├── browser/    → guardian-risk-browser (stub)
│   ├── redis/      → guardian-risk-redis (stub)
│   ├── vpn/        → guardian-risk-vpn (stub)
│   └── logger/     → guardian-risk-logger (stub)
└── examples/
    └── bot-detection/
```

## Development

```bash
pnpm install
pnpm build          # builds core + plugin stubs
pnpm test           # core tests
pnpm lint
pnpm typecheck
```

## Examples

- [`examples/bot-detection/`](examples/bot-detection/) — bot risk scoring with custom rules
- [`examples/express-api/`](examples/express-api/) — Express middleware + full plugin stack

## Publishing

See [PUBLISHING.md](PUBLISHING.md) for npm publish steps.

See [MIGRATION.md](MIGRATION.md) when upgrading between major/minor versions.

See [ECOSYSTEM.md](ECOSYSTEM.md) for how users discover and install all packages.

## Security

- **Zero runtime dependencies** — nothing installed with the package
- **No install scripts** — no code runs on `npm install`
- Prototype pollution protection on signal keys
- Rule `when()` and plugin `install()` errors isolated
- Score bounds and resource limits (see [SECURITY.md](SECURITY.md))
- CI runs `pnpm audit` on every push; Dependabot enabled

Report vulnerabilities privately via [GitHub Security Advisories](https://github.com/himanshu6306singh/guardian-risk/security/advisories/new).

## License

MIT
