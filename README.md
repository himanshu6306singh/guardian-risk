# Guardian

**A production-ready risk decision engine for TypeScript.**

Guardian helps developers answer one question:

> Based on my application's rules, how risky is this action?

It is **not** a bot detection library. It is a composable engine — like Zod validates data and Prisma manages databases, Guardian evaluates risk.

**Current release:** `guardian-risk@0.3.1` · plugins `@0.2.1`

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
npm install guardian-risk
```

## Quick start (core only)

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

## Production stack (Express)

```bash
npm install guardian-risk guardian-risk-express guardian-risk-redis guardian-risk-vpn guardian-risk-logger
# optional: npm install ioredis
```

```typescript
import express from 'express';
import { Guardian } from 'guardian-risk';
import { expressPlugin, guardianMiddleware } from 'guardian-risk-express';
import { redisPlugin } from 'guardian-risk-redis';
import { vpnPlugin, StaticIpProvider } from 'guardian-risk-vpn';
import { loggerPlugin } from 'guardian-risk-logger';

const app = express();
app.set('trust proxy', 1);

const template = new Guardian()
  .use(expressPlugin({ trustProxy: true }))
  .use(redisPlugin({ url: process.env.REDIS_URL, allowInMemoryFallback: false }))
  .use(vpnPlugin({ provider: new StaticIpProvider({}), vpnScore: 25 }))
  .use(loggerPlugin({ minScore: 20 }))
  .rule({ name: 'Burst', when: (s) => (s.requestsInWindow as number) > 30, score: 40 });

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use(
  guardianMiddleware(template, {
    blockAboveScore: 80,
    onAnalyzeError: 'block',
    exposeBlockDetails: false,
  }),
);
```

See [`examples/express-api/`](examples/express-api/) for a full production-oriented server.

## Core concepts

| Concept | Description |
|---------|-------------|
| **Signals** | Input values (e.g. `clientIp`, `loginAttempts`) |
| **Rules** | Conditions that add risk when matched |
| **Engine** | Runs every rule against signals |
| **Report** | Immutable score, level, reasons, matched rules |
| **Plugins** | Load signals from HTTP, Redis, VPN, browser, logs |

## Official plugins

| Package | npm | Purpose |
|---------|-----|---------|
| [`guardian-risk`](packages/core) | [npm](https://www.npmjs.com/package/guardian-risk) | Core engine (required) |
| [`guardian-risk-express`](packages/express) | [npm](https://www.npmjs.com/package/guardian-risk-express) | Express middleware + validated IP |
| [`guardian-risk-redis`](packages/redis) | [npm](https://www.npmjs.com/package/guardian-risk-redis) | Session counters, rate limits |
| [`guardian-risk-vpn`](packages/vpn) | [npm](https://www.npmjs.com/package/guardian-risk-vpn) | VPN / proxy / Tor signals |
| [`guardian-risk-browser`](packages/browser) | [npm](https://www.npmjs.com/package/guardian-risk-browser) | Pointer, keyboard, UA signals |
| [`guardian-risk-logger`](packages/logger) | [npm](https://www.npmjs.com/package/guardian-risk-logger) | Audit logging |

All plugins are **production-ready** at `0.2.x` when used with the [production checklist](SECURITY.md#production-checklist).

## Plugin rules

- Install each plugin **once** per `Guardian` template
- Use `template.fork()` or `guardianMiddleware()` — **one fork per request**
- Use `await guardian.analyzeAsync(req)` when plugins are installed
- Rules and plugins are **trusted code** — never load from user JSON
- `guardian.reset()` clears signals only; rules and plugins persist

## Features (v0.3)

- **Lifecycle hooks** — `beforeAnalyze` / `afterAnalyze`
- **Typed signals** — `defineSignals<T>()`
- **Rule groups** — cap combined scores per group
- **Presets** — `botDetectionRules`, `loginProtectionRules`
- **Security** — zero deps, signal validation, hook timeouts, fail-closed middleware

## Monorepo structure

```
guardian/
├── packages/
│   ├── core/       → guardian-risk
│   ├── express/    → guardian-risk-express
│   ├── browser/    → guardian-risk-browser
│   ├── redis/      → guardian-risk-redis
│   ├── vpn/        → guardian-risk-vpn
│   └── logger/     → guardian-risk-logger
└── examples/
    ├── bot-detection/
    └── express-api/
```

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm prepublish:check
```

## Documentation

- [MIGRATION.md](MIGRATION.md) — upgrade guide (0.2.x → 0.3.x)
- [SECURITY.md](SECURITY.md) — production checklist + vulnerability reporting
- [ECOSYSTEM.md](ECOSYSTEM.md) — all npm packages
- [PUBLISHING.md](PUBLISHING.md) — release steps
- [CHANGELOG.md](CHANGELOG.md) — version history

## Security

- **Zero runtime dependencies** (core)
- **No install scripts**
- Validated signals, prototype pollution guards, score bounds
- See [SECURITY.md](SECURITY.md)

Report vulnerabilities via [GitHub Security Advisories](https://github.com/himanshu6306singh/guardian-risk/security/advisories/new).

## License

MIT
