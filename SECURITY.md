# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| 0.2.x   | Yes       |
| < 0.2   | No        |

## Reporting a vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Email or open a **private security advisory** on GitHub:

- [GitHub Security Advisories](https://github.com/himanshu6306singh/guardian-risk/security/advisories/new)

We aim to respond within **72 hours** and publish a fix within **14 days** for confirmed issues.

## Security design

`guardian-risk` is designed with a **minimal attack surface**:

| Property | Status |
|----------|--------|
| Runtime dependencies | **Zero** — nothing installed with the package |
| Install scripts | **None** — no `preinstall` / `postinstall` on consumer install |
| Signal values | Primitives only (`string`, `number`, `boolean`, `null`) |
| Prototype pollution | Blocked keys: `__proto__`, `constructor`, `prototype` |
| Signal snapshots | `Object.create(null)` — prototype-free |
| Rule evaluation | `when()` errors caught — rules cannot crash the engine |
| Resource limits | Max 1,000 signals and 1,000 rules per instance |
| Rule score bounds | Per-rule scores clamped to ±10,000; total capped at ±1,000,000 |
| Plugin install | `install()` failures isolated — plugin not registered on error |

## Safe usage guidelines

1. **Rules must be defined in code** — never load rule `when` functions from untrusted JSON or user input.
2. **Plugins should be trusted** — only `use()` plugins from official `@guardian-risk-*` packages or your own code.
3. **Signals are facts, not code** — only pass validated primitive values.
4. **One Guardian per request** — use `reset()` or create a new instance per HTTP request to avoid signal leakage.

## Dependency policy

- Core package: **no production dependencies**
- Plugin packages: peer-depend on `guardian-risk` only; optional peers documented
- CI runs `pnpm audit` on every push
- Dependabot enabled for dependency updates

## npm provenance

Published releases use [npm provenance](https://docs.npmjs.com/generating-provenance-statements) when published via GitHub Actions.
