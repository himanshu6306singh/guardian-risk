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

## API

- `guardian.signal(key, value)` — add a signal
- `guardian.rule({ name, when, score, reason? })` — register a rule
- `guardian.analyze()` — run evaluation, returns `RiskReport`
- `guardian.reset()` — clear signals (rules persist)

## License

MIT
