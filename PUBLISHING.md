# Publishing to npm

## One-time setup

```bash
npm logout
npm login
# Username: your-npm-username
# Password: paste npm_ access token (NOT your account password)
npm whoami
```

Create token: [npmjs.com/settings/~tokens](https://www.npmjs.com/settings/~tokens) → Granular Access Token → Read and write → **Bypass 2FA**

---

## Every release (copy-paste checklist)

### 1. Bump version

```bash
cd /Users/user/Desktop/guardian

# Core — pick one:
cd packages/core && npm version patch && cd ../..   # 0.2.1 → 0.2.2
cd packages/core && npm version minor && cd ../..   # 0.2.1 → 0.3.0
cd packages/core && npm version major && cd ../..   # 0.2.1 → 1.0.0

# Plugins (after core is published):
cd packages/express && npm version patch && cd ../..
cd packages/browser && npm version patch && cd ../..
cd packages/redis && npm version patch && cd ../..
cd packages/vpn && npm version patch && cd ../..
cd packages/logger && npm version patch && cd ../..
```

### 2. Verify before publish

```bash
pnpm prepublish:check
```

### 3. Publish

**Always publish core first**, then plugins.

```bash
# Core only
pnpm publish:core

# All plugins
pnpm publish:plugins

# Core + all plugins
pnpm publish:all
```

### 4. Push to GitHub

```bash
git add -A
git commit -m "release: guardian-risk@X.Y.Z"
git push origin dev
git tag vX.Y.Z
git push origin vX.Y.Z
```

---

## Commands reference

| What | Command |
|------|---------|
| **Pre-publish check** | `pnpm prepublish:check` |
| **Publish core** | `pnpm publish:core` |
| **Publish all plugins** | `pnpm publish:plugins` |
| **Publish everything** | `pnpm publish:all` |
| **Publish one plugin** | `pnpm --filter guardian-risk-express publish --access public --no-git-checks` |
| **Dry run (no upload)** | `pnpm --filter guardian-risk publish --dry-run --no-git-checks` |
| **Check what's on npm** | `npm view guardian-risk version` |

Replace `guardian-risk-express` with any plugin name:

- `guardian-risk-browser`
- `guardian-risk-redis`
- `guardian-risk-vpn`
- `guardian-risk-logger`

---

## Publish order

1. `guardian-risk` (core) — plugins peer-depend on it
2. `guardian-risk-express`
3. `guardian-risk-browser`
4. `guardian-risk-redis`
5. `guardian-risk-vpn`
6. `guardian-risk-logger`

---

## Provenance (Socket supply chain score)

**Local publish** — works now (no provenance flag in package.json):

```bash
pnpm publish:core
```

**GitHub Actions publish** — adds npm provenance automatically when you create a GitHub Release:

1. Add `NPM_TOKEN` secret in repo Settings → Secrets
2. Create release on GitHub (tag `v0.3.1`)
3. Workflow `.github/workflows/release.yml` runs `publish --provenance`

> Do **not** set `"provenance": true` in `package.json` — it breaks local `pnpm publish`.

---

## Package names

| npm package | Folder |
|-------------|--------|
| `guardian-risk` | `packages/core` |
| `guardian-risk-express` | `packages/express` |
| `guardian-risk-browser` | `packages/browser` |
| `guardian-risk-redis` | `packages/redis` |
| `guardian-risk-vpn` | `packages/vpn` |
| `guardian-risk-logger` | `packages/logger` |

## User install

```bash
npm install guardian-risk
npm install guardian-risk guardian-risk-express guardian-risk-vpn
```
