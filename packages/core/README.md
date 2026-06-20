# guardian-risk

Configurable risk decision engine for TypeScript. Evaluate signals against rules and get an explainable risk score.

**Production-ready** at `0.3.x` — zero runtime dependencies, hardened validation, async hooks, and official plugins for Express, Redis, VPN, browser, and logging.

## Install

```bash
npm install guardian-risk
```

## Usage (core only)

No plugins required — sync `analyze()` works when no hooks are registered:

```typescript
import { Guardian } from 'guardian-risk';

const guardian = new Guardian();

const report = guardian
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
  })
  .analyze();

console.log(report.score); // 35
console.log(report.level); // MEDIUM
```

## Official plugins

Install **core first**, then add only the plugins you need:

| Package | Install | Purpose |
|---------|---------|---------|
| **guardian-risk** (this) | `npm i guardian-risk` | Core engine |
| guardian-risk-express | `npm i guardian-risk-express` | Express middleware + validated IP |
| guardian-risk-redis | `npm i guardian-risk-redis` | Redis session counters + rate limits |
| guardian-risk-vpn | `npm i guardian-risk-vpn` | VPN / proxy / Tor detection |
| guardian-risk-browser | `npm i guardian-risk-browser` | Browser behavioral signals |
| guardian-risk-logger | `npm i guardian-risk-logger` | Audit logging |

```bash
npm install guardian-risk guardian-risk-express guardian-risk-redis guardian-risk-vpn guardian-risk-logger
npm install ioredis   # optional, required for Redis in production
```

### Production Express example

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

> Use your own IP intelligence provider in production (MaxMind, IPinfo, etc.) — not the dev-only `IpApiProvider`.

## Plugins API

```typescript
import type { Plugin } from 'guardian-risk';

const myPlugin: Plugin = {
  name: 'my-plugin',
  install(guardian) {
    guardian.beforeAnalyze(async ({ guardian: g }) => {
      g.signal('customSignal', true);
    });
  },
};

await new Guardian().use(myPlugin).analyzeAsync();
```

## Typed signals & presets

```typescript
import { defineSignals, applyRules, botDetectionRules } from 'guardian-risk';

const bot = defineSignals<{ mouseLinearity: number; headlessUA: boolean }>();

const guardian = applyRules(bot.create(), botDetectionRules)
  .signal('mouseLinearity', 0.95)
  .signal('headlessUA', true);

const report = await guardian.analyzeAsync();
```

## Rule groups

```typescript
guardian.ruleGroup({
  name: 'login',
  maxScore: 40,
  rules: [
    { name: 'BruteForce', when: (s) => (s.loginAttempts as number) > 5, score: 45 },
  ],
});
```

## API

| Method | Description |
|--------|-------------|
| `guardian.signal(key, value)` | Add a signal |
| `guardian.getSignal(key)` | Read a signal without modifying state |
| `guardian.rule({ name, when, score, reason? })` | Register a rule |
| `guardian.ruleGroup({ name, maxScore, rules })` | Register capped rule group |
| `guardian.use(plugin)` | Install a plugin (once per name) |
| `guardian.beforeAnalyze(hook)` | Run hook before evaluation (async OK) |
| `guardian.afterAnalyze(hook)` | Run hook after report is built |
| `guardian.analyze()` | Sync analysis (only when no hooks registered) |
| `guardian.analyzeAsync(context?)` | Async analysis with lifecycle hooks |
| `guardian.fork()` | Clone rules/plugins for per-request use |
| `guardian.reset()` | Clear signals (rules + plugins persist) |
| `guardian.getInstalledPlugins()` | List installed plugin names |

## Production checklist

1. One **template** `Guardian` at startup; `fork()` or middleware per request
2. `await analyzeAsync(req)` when plugins are installed
3. `app.set('trust proxy', 1)` behind load balancers
4. `REDIS_URL` set; `allowInMemoryFallback: false` in production
5. Your own VPN/IP provider — not default external APIs
6. `onAnalyzeError: 'block'` and `exposeBlockDetails: false` when blocking
7. Browser/client signals are hints only — never sole auth factor

Full details: [SECURITY.md](https://github.com/himanshu6306singh/guardian-risk/blob/main/SECURITY.md)

## Security

- **Zero runtime dependencies** — minimal supply chain risk
- **No install scripts** — nothing runs on `npm install`
- String signals capped at 4 KB; `NaN`/`Infinity` rejected
- Prototype pollution protection on signal keys
- Rule `when()` errors isolated — engine stays stable
- Hook timeout (10s); rules/plugins locked during `analyzeAsync()`
- Deep-frozen matched rules in reports
- Score bounds: ±10,000 per rule, ±1,000,000 total

See [SECURITY.md](https://github.com/himanshu6306singh/guardian-risk/blob/main/SECURITY.md) for vulnerability reporting.

## Links

- [GitHub monorepo](https://github.com/himanshu6306singh/guardian-risk)
- [Migration guide](https://github.com/himanshu6306singh/guardian-risk/blob/main/MIGRATION.md)
- [All packages](https://github.com/himanshu6306singh/guardian-risk/blob/main/ECOSYSTEM.md)

## License

MIT
