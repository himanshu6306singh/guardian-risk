# Publishing to npm

The publishable package is **`guardian-risk`** (`packages/core`).

> `@guardianjs/core` is already taken on npm by another project. This library publishes as **`guardian-risk`**.

## Prerequisites

1. [npm account](https://www.npmjs.com/signup)
2. Log in locally:

```bash
npm login
```

3. Verify the name is still available:

```bash
npm view guardian-risk
# Should return 404 before first publish
```

## Pre-publish checklist

```bash
cd /path/to/guardian

pnpm install
pnpm prepublish:check   # test + build + lint + typecheck
```

## Publish commands

### First publish (from monorepo root)

```bash
pnpm --filter guardian-risk publish --access public
```

Or use the shortcut:

```bash
pnpm publish:core
```

### Bump version and publish

```bash
cd packages/core
npm version patch   # or minor / major
cd ../..
pnpm publish:core
```

### Dry run (see what would be uploaded)

```bash
pnpm --filter guardian-risk publish --dry-run
```

## What gets published

Only these files ship to npm (see `packages/core/package.json` `files`):

- `dist/` — built ESM, CJS, and TypeScript declarations
- `README.md`
- `LICENSE`

Source, tests, and examples stay in the repo only.

## After publish

Users install with:

```bash
npm install guardian-risk
```

```typescript
import { Guardian } from 'guardian-risk';
```
