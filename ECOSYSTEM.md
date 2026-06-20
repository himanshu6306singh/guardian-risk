# Guardian Risk — Package Ecosystem

How users find, install, and use all Guardian packages on npm.

## Current versions (npm)

| Package | Version | Status |
|---------|---------|--------|
| `guardian-risk` | `0.3.1` | Production-ready core |
| `guardian-risk-express` | `0.2.1` | Production middleware |
| `guardian-risk-redis` | `0.2.1` | Production session store |
| `guardian-risk-vpn` | `0.2.1` | Production (bring your IP provider) |
| `guardian-risk-browser` | `0.2.1` | Defense-in-depth client signals |
| `guardian-risk-logger` | `0.2.1` | Production audit logging |

---

## How npm works (important)

**Each package = one npm page.** There is no single npm page that lists all your packages automatically.

| What users see | Where |
|----------------|-------|
| `guardian-risk` only | https://www.npmjs.com/package/guardian-risk |
| Each plugin | Its own URL after you publish it |

Users discover plugins through:

1. **README on `guardian-risk`** (main entry — updated in `packages/core/README.md`)
2. **npm search** — shared keyword `guardian-risk` on every package
3. **GitHub repo** — monorepo README + this file
4. **Your docs / website** (later)

---

## Recommended approach: `guardian-risk-*` naming (current)

**Best for you right now.** No npm org fee, names are clear, already set up.

### Package list

| npm install | Package |
|-------------|---------|
| `npm i guardian-risk` | Core engine (required) |
| `npm i guardian-risk-express` | Express plugin |
| `npm i guardian-risk-browser` | Browser plugin |
| `npm i guardian-risk-redis` | Redis plugin |
| `npm i guardian-risk-vpn` | VPN plugin |
| `npm i guardian-risk-logger` | Logger plugin |

### How users install

**They install core + only what they need** (not all packages):

```bash
# Minimal — core only
npm install guardian-risk

# Express app with VPN checks
npm install guardian-risk guardian-risk-express guardian-risk-vpn

# Full stack
npm install guardian-risk guardian-risk-express guardian-risk-browser guardian-risk-redis guardian-risk-vpn guardian-risk-logger
```

### How users find plugins (without searching each name)

1. Land on [guardian-risk npm page](https://www.npmjs.com/package/guardian-risk) → README **Official plugins** table
2. Search npm: `guardian-risk` → shows all packages with that keyword
3. GitHub: [himanshu6306singh/guardian-risk](https://github.com/himanshu6306singh/guardian-risk)

### Pros

- Free, no org setup
- Clear names (`guardian-risk-express` is self-explanatory)
- Install only what you need (smaller bundle)
- Same pattern as `eslint-plugin-*`, `babel-plugin-*`

### Cons

- No single npm "org profile" page (unless you create an org later)
- Users must read README or search — they won't see all packages on one npm page

---

## Alternative: npm organization (e.g. `@guardian-risk/*`)

Example names:

```
@guardian-risk/core
@guardian-risk/express
@guardian-risk/browser
```

### Pros

- All packages under one org on npm: https://www.npmjs.com/org/guardian-risk
- Looks more "official" / enterprise
- Scoped names avoid conflicts

### Cons

- Must create npm org (free for public packages)
- Must rename and republish everything
- Users type scoped names: `npm i @guardian-risk/express`
- Migration work if you already published `guardian-risk`

### When to switch

Consider an org when you have traction, multiple maintainers, or want a branded org page. **Not required for v0.x.**

---

## Alternative: meta package (not recommended yet)

A single package `guardian-risk-all` that re-exports everything.

### Cons

- Forces users to install browser + redis even if they only need Express
- Larger install size
- Hides optional dependencies

Skip until you have a strong reason.

---

## Comparison

| Approach | User discovers plugins | Install command | Effort |
|----------|------------------------|-----------------|--------|
| **`guardian-risk-*` (current)** | README + npm keyword search | `npm i guardian-risk-express` | Done |
| **npm org `@guardian-risk/*`** | Org page + README | `npm i @guardian-risk/express` | Rename + republish |
| **Meta package** | One package | `npm i guardian-risk-all` | Extra maintenance |

**Recommendation:** Stay with `guardian-risk-*` for now. Link all packages in the core README (shows on npm). Add an org later if the project grows.

---

## Publishing all packages

From monorepo root:

```bash
pnpm prepublish:check

# 1. Core first (plugins depend on it)
pnpm publish:core --no-git-checks

# 2. All plugins
pnpm publish:plugins --no-git-checks
```

Or one at a time:

```bash
pnpm --filter guardian-risk-express publish --access public --no-git-checks
```

See [PUBLISHING.md](./PUBLISHING.md) for auth (token / OTP).

---

## After publishing — what users see

| URL | Content |
|-----|---------|
| https://www.npmjs.com/package/guardian-risk | Core + plugin table in README |
| https://www.npmjs.com/package/guardian-risk-express | Express plugin docs |
| https://www.npmjs.com/search?q=guardian-risk | All related packages |

Update the core README and republish whenever you add a new plugin — that's your main discovery hub on npm.
