# guardian-risk

Configurable risk decision engine for TypeScript. Evaluate signals against rules and get an explainable risk score.

## Install

```bash
npm install guardian-risk
```

## Usage

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
| guardian-risk-express | `npm i guardian-risk-express` | Express request signals |
| guardian-risk-browser | `npm i guardian-risk-browser` | Browser behavioral signals |
| guardian-risk-redis | `npm i guardian-risk-redis` | Redis session counters |
| guardian-risk-vpn | `npm i guardian-risk-vpn` | VPN / proxy / Tor detection |
| guardian-risk-logger | `npm i guardian-risk-logger` | Audit logging |

```bash
# Example: Express + VPN + Logger stack
npm install guardian-risk guardian-risk-express guardian-risk-vpn guardian-risk-logger
```

```typescript
import express from 'express';
import { Guardian } from 'guardian-risk';
import { expressPlugin, guardianMiddleware, type ExpressRequest } from 'guardian-risk-express';
import { redisPlugin } from 'guardian-risk-redis';
import { vpnPlugin, StaticIpProvider } from 'guardian-risk-vpn';
import { loggerPlugin } from 'guardian-risk-logger';

const app = express();

const riskTemplate = new Guardian()
  .use(expressPlugin({ trustProxy: true }))
  .use(redisPlugin())
  .use(vpnPlugin({ provider: new StaticIpProvider({}) }))
  .use(loggerPlugin())
  .rule({ name: 'Burst', when: (s) => (s.requestsPerMinute as number) > 30, score: 40 });

app.use(guardianMiddleware(riskTemplate, { blockAboveScore: 80 }));

app.post('/login', (req: ExpressRequest, res) => {
  res.json(req.riskReport);
});
```

> Plugin packages are early stubs — APIs may change before `1.0.0`.

## Plugins API

```typescript
import type { Plugin } from 'guardian-risk';

const myPlugin: Plugin = {
  name: 'my-plugin',
  install(guardian) {
    guardian.rule({ name: 'Custom', when: () => true, score: 10 });
  },
};

new Guardian().use(myPlugin);
```

## Typed signals & presets (v0.3)

```typescript
import { defineSignals, applyRules, botDetectionRules } from 'guardian-risk';

const bot = defineSignals<{ mouseLinearity: number; headlessUA: boolean }>();

const guardian = applyRules(bot.create(), botDetectionRules)
  .signal('mouseLinearity', 0.95)
  .signal('headlessUA', true);

const report = await guardian.analyzeAsync();
```

## Rule groups (v0.3)

```typescript
guardian.ruleGroup({
  name: 'login',
  maxScore: 40,
  rules: [
    { name: 'BruteForce', when: (s) => (s.loginAttempts as number) > 5, score: 45 },
  ],
});
```

See [MIGRATION.md](../../MIGRATION.md) when upgrading versions.

## API

| Method | Description |
|--------|-------------|
| `guardian.signal(key, value)` | Add a signal |
| `guardian.rule({ name, when, score, reason? })` | Register a rule |
| `guardian.use(plugin)` | Install a plugin (once per name) |
| `guardian.beforeAnalyze(hook)` | Run hook before evaluation (async OK) |
| `guardian.afterAnalyze(hook)` | Run hook after report is built |
| `guardian.analyze()` | Sync analysis (no hooks registered) |
| `guardian.analyzeAsync(context?)` | Async analysis with lifecycle hooks |
| `guardian.fork()` | Clone rules/plugins for per-request use |
| `guardian.reset()` | Clear signals (rules + plugins persist) |
| `guardian.getInstalledPlugins()` | List installed plugin names |

## Security

- **Zero runtime dependencies** — minimal supply chain risk
- **No install scripts** — nothing runs on `npm install`
- Prototype pollution protection on signal keys
- Rule `when()` errors isolated — engine stays stable
- Score bounds: ±10,000 per rule, ±1,000,000 total
- Plugin `install()` failures throw `PluginInstallError` without registering
- See [SECURITY.md](SECURITY.md) for vulnerability reporting

## Links

- [GitHub monorepo](https://github.com/himanshu6306singh/guardian-risk)
- [All packages guide](https://github.com/himanshu6306singh/guardian-risk/blob/main/ECOSYSTEM.md)

## License

MIT
