# guardian-risk

Configurable risk decision engine for TypeScript. Evaluate signals against rules and get an explainable risk score.

## Install

```bash
npm install guardian-risk
# or
pnpm add guardian-risk
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

## Plugins

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

## API

| Method | Description |
|--------|-------------|
| `guardian.signal(key, value)` | Add a signal |
| `guardian.rule({ name, when, score, reason? })` | Register a rule |
| `guardian.use(plugin)` | Install a plugin (once per name) |
| `guardian.analyze()` | Run evaluation, returns `RiskReport` |
| `guardian.reset()` | Clear signals (rules + plugins persist) |
| `guardian.getInstalledPlugins()` | List installed plugin names |

## License

MIT
