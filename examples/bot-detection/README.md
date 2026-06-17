# Bot Detection Example

This example demonstrates how to use Guardian for **bot risk scoring**.

> **Important:** Guardian does not detect bots. It evaluates risk based on **your rules** and **your signals**. You are responsible for collecting signals (mouse patterns, request rates, user agents, etc.) and defining what constitutes risky behavior.

## Signals used

| Signal | Example value | Meaning (your definition) |
|--------|--------------|---------------------------|
| `mouseLinearity` | `0.95` | How linear mouse movement is (0–1) |
| `requestBurst` | `120` | Requests in a short time window |
| `headlessUA` | `true` | User agent looks headless |
| `sessionAge` | `3` | Session age in seconds |

## Rules

| Rule | Condition | Score |
|------|-----------|-------|
| LinearMouseMovement | `mouseLinearity > 0.9` | +25 |
| RequestBurst | `requestBurst > 50` | +30 |
| HeadlessBrowser | `headlessUA === true` | +40 |
| NewSession | `sessionAge < 10` | +10 |

With the example values, all four rules match → score **105** → level **CRITICAL**.

## Run

```bash
pnpm install
pnpm --filter guardian-risk-example-bot-detection start
```

## Architecture note

In production, signals would come from:

- **Browser plugin** — mouse/keyboard/fingerprint collectors
- **Express middleware** — request rate, headers, IP
- **Redis plugin** — session counters and event history

Guardian only evaluates. It never collects data itself.
