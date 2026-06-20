# Migration Guide

How to upgrade `guardian-risk` and plugins without breaking your app.

## Version overview

| Version | Type | Summary |
|---------|------|---------|
| **0.1.x** | Initial | Core + stub plugins |
| **0.2.x** | Security | Validation, limits, prototype guards |
| **0.3.0** | **Breaking** | Real plugins, async hooks, typed signals, rule groups, production security |

---

## Upgrading 0.2.x → 0.3.0

### Who is unaffected

**Core-only users** (no plugins, sync `analyze()`):

```typescript
new Guardian().signal('x', 1).rule({ ... }).analyze();
```

This still works on 0.3.0+ if you do **not** register hooks.

### Breaking change 1: Plugins + `analyze()`

Plugins now register lifecycle hooks. Sync `analyze()` **throws** when hooks exist:

```text
Guardian has analyze hooks registered. Use analyzeAsync() instead of analyze().
```

**Before (0.1.x–0.2.x stubs):**

```typescript
const guardian = new Guardian()
  .use(expressPlugin())
  .use(vpnPlugin());

const report = guardian.analyze();
```

**After (0.3.0+):**

```typescript
const template = new Guardian()
  .use(expressPlugin({ trustProxy: true }))
  .use(vpnPlugin({ provider: myProvider }));

const report = await template.fork().analyzeAsync(req);
```

Or use Express middleware:

```typescript
app.use(guardianMiddleware(template, { trustProxy: true }));
// req.riskReport available in routes
```

### Breaking change 2: `analyzeAndLog()` is async

**Before:**

```typescript
const report = analyzeAndLog(guardian);
```

**After:**

```typescript
const report = await analyzeAndLog(guardian, req);
```

### Breaking change 3: Stub signals removed

Old stubs set placeholder signals like `expressPlugin: 'stub'`. New plugins set real signals (`clientIp`, `userAgent`, etc.). Update rules that referenced stub keys.

### Recommended `package.json`

```json
{
  "dependencies": {
    "guardian-risk": "^0.3.1",
    "guardian-risk-express": "^0.2.1"
  },
  "optionalDependencies": {
    "ioredis": "^5"
  }
}
```

### New in 0.3.0

#### Typed signals

```typescript
import { defineSignals } from 'guardian-risk';

const bot = defineSignals<{
  mouseLinearity: number;
  headlessUA: boolean;
}>();

const guardian = bot.create()
  .signal('mouseLinearity', 0.95)
  .rule({ name: 'Linear', when: (s) => s.mouseLinearity > 0.9, score: 20 });
```

#### Rule groups (score caps)

```typescript
guardian.ruleGroup({
  name: 'login',
  maxScore: 40,
  rules: [
    { name: 'BruteForce', when: (s) => s.loginAttempts > 5, score: 45 },
    { name: 'Burst', when: (s) => s.requestsPerMinute > 10, score: 25 },
  ],
});
```

#### Preset rule packs

```typescript
import { applyRules, botDetectionRules } from 'guardian-risk';

const guardian = applyRules(new Guardian(), botDetectionRules);
```

#### Redis (multi-instance)

```typescript
import { redisPlugin, createRedisStore } from 'guardian-risk-redis';

.use(redisPlugin({ url: process.env.REDIS_URL, allowInMemoryFallback: false }))
```

Install optional peer: `npm install ioredis`

#### Browser collector

```typescript
import { BrowserCollector, browserPlugin } from 'guardian-risk-browser';

const collector = new BrowserCollector();
const stop = collector.start();
// ... user interacts ...
collector.applyTo(guardian);
stop();
```

#### Production security (0.3.0)

| Area | Change |
|------|--------|
| **Core** | String cap 4 KB; hook timeout; analyze lock; deep-frozen reports |
| **express** | Validated IP; `onAnalyzeError`, `exposeBlockDetails` middleware options |
| **redis** | Session ID sanitization; `allowInMemoryFallback` defaults to `false` |
| **vpn** | No default external provider; reuses `clientIp` signal |
| **logger** | Redacts headers from log context |
| **browser** | Touch/pointer activity for mobile |

---

## Upgrading 0.3.0 → 0.3.1

Documentation-only release. No code or API changes. Safe to upgrade without code changes.

```json
{
  "dependencies": {
    "guardian-risk": "^0.3.1",
    "guardian-risk-express": "^0.2.1"
  }
}
```

---

## Staying on an old version

Pin exact versions to avoid automatic upgrades:

```json
"guardian-risk": "0.2.1",
"guardian-risk-express": "0.1.0"
```

---

## Express production checklist (0.3.0+)

1. Create one **template** `Guardian` at startup with rules + plugins
2. Use `guardianMiddleware(template)` or `template.fork()` per request
3. Use `await guardian.analyzeAsync(req)` — never shared `analyze()` across requests
4. `app.set('trust proxy', 1)` behind load balancers
5. Set `REDIS_URL`; do not rely on in-memory fallback in production
6. Provide your own VPN/IP provider in production
7. Use `onAnalyzeError: 'block'` and `exposeBlockDetails: false` when blocking

---

## Need help?

- [GitHub Issues](https://github.com/himanshu6306singh/guardian-risk/issues)
- [Security advisories](https://github.com/himanshu6306singh/guardian-risk/security/policy)
