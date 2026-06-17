# Publishing to npm

## Package ecosystem

| Package | Folder | npm page (after publish) |
|---------|--------|--------------------------|
| `guardian-risk` | `packages/core` | https://www.npmjs.com/package/guardian-risk |
| `guardian-risk-express` | `packages/express` | https://www.npmjs.com/package/guardian-risk-express |
| `guardian-risk-browser` | `packages/browser` | https://www.npmjs.com/package/guardian-risk-browser |
| `guardian-risk-redis` | `packages/redis` | https://www.npmjs.com/package/guardian-risk-redis |
| `guardian-risk-vpn` | `packages/vpn` | https://www.npmjs.com/package/guardian-risk-vpn |
| `guardian-risk-logger` | `packages/logger` | https://www.npmjs.com/package/guardian-risk-logger |

See [ECOSYSTEM.md](./ECOSYSTEM.md) for how users discover and install packages.

## Prerequisites

1. [npm account](https://www.npmjs.com/signup)
2. Log in with token (recommended — no OTP each time):

```bash
npm logout
npm login
# Username: your-username
# Password: paste npm_ access token (not your password)
```

Create token: [npmjs.com/settings/~tokens](https://www.npmjs.com/settings/~tokens) → Granular Access Token → Read and write → **Bypass 2FA**

3. Verify login:

```bash
npm whoami
```

## Pre-publish checklist

```bash
cd /path/to/guardian
pnpm install
pnpm prepublish:check
```

## Publish commands

### Publish core (do this first)

```bash
pnpm publish:core --no-git-checks
```

### Publish all plugins

```bash
pnpm publish:plugins --no-git-checks
```

### Publish everything (core + plugins)

```bash
pnpm publish:all --no-git-checks
```

### Publish one plugin

```bash
pnpm --filter guardian-risk-express publish --access public --no-git-checks
```

### Dry run

```bash
pnpm --filter guardian-risk-express publish --dry-run --no-git-checks
```

## Publish order

Always publish **core before plugins** (plugins peer-depend on `guardian-risk ^0.2.0`).

1. `guardian-risk` @ `0.2.0`
2. All `guardian-risk-*` plugins @ `0.1.0`

## Bump versions

```bash
cd packages/core && npm version patch && cd ../..
pnpm publish:core --no-git-checks

cd packages/express && npm version patch && cd ../..
pnpm --filter guardian-risk-express publish --access public --no-git-checks
```

## What gets published per package

- `dist/` — built JS + types
- `README.md`
- `LICENSE`

Source and tests stay in the repo only.

## User install examples

```bash
# Core only
npm install guardian-risk

# Core + Express
npm install guardian-risk guardian-risk-express

# Stack
npm install guardian-risk guardian-risk-express guardian-risk-vpn guardian-risk-logger
```
