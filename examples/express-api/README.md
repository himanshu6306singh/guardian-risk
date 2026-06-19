# Express API example

Risk scoring middleware for an Express app using the full Guardian plugin stack.

## Run

```bash
# From repo root (after build)
pnpm build
pnpm install
pnpm --filter guardian-example-express-api start
```

## Try it

```bash
# Low risk
curl -X POST http://localhost:3000/login -H "x-session-id: user-1"

# Higher risk (headless UA + session burst)
curl -X POST http://localhost:3000/login \
  -H "x-session-id: user-1" \
  -H "User-Agent: HeadlessChrome/1.0"
```

Responses include `score`, `level`, and `reasons`. Requests scoring above **80** are blocked with HTTP 403.
