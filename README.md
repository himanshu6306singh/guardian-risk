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

> **npm package name:** `guardian-risk` (`@guardianjs/core` is already taken on npm by another project).

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
| **Plugins** | Extra capabilities (coming in v0.2) |

## Scoring

Score is the **sum of all matched rule scores**. Risk levels are configurable:

| Score | Default level |
|-------|---------------|
| 0–20 | LOW |
| 21–40 | MEDIUM |
| 41–60 | HIGH |
| 61+ | CRITICAL |

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
```

## Examples

See [`examples/bot-detection/`](examples/bot-detection/) for a bot-risk scoring example built on top of the core engine.

## Publishing

See [PUBLISHING.md](PUBLISHING.md) for npm publish steps.

## License

MIT
