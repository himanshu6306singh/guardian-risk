# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| 0.3.x   | Yes       |
| 0.2.x   | Security fixes only |
| < 0.2   | No        |

## Reporting a vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Open a **private security advisory** on GitHub:

- [GitHub Security Advisories](https://github.com/himanshu6306singh/guardian-risk/security/advisories/new)

We aim to respond within **72 hours** and publish a fix within **14 days** for confirmed issues.

## Security design

| Property | Status |
|----------|--------|
| Runtime dependencies (core) | **Zero** |
| Install scripts | **None** |
| Signal values | Primitives only; strings capped at 4 KB |
| Signal numbers | Finite only (`NaN`/`Infinity` rejected) |
| Prototype pollution | Blocked keys + `Map` storage + null-prototype snapshots |
| Rule evaluation | `when()` errors isolated |
| Analyze hooks | 10s timeout per hook |
| Configuration lock | Rules/plugins cannot be added during `analyzeAsync()` |
| Reports | Deep-frozen matched rules |
| Resource limits | Max 1,000 signals/rules; score bounds enforced |

## Plugin trust model

Plugins process **untrusted HTTP input**. Treat signals as **hints**, not facts:

| Input | Trust level |
|-------|-------------|
| `clientIp` | Validated IP only; use `trust proxy` + Express `trust proxy` setting |
| `x-session-id` | Client-supplied — bind to server session in production |
| `userAgent`, headers | Spoofable |
| Browser behavioral signals | Fully client-controlled |
| VPN lookup | Use your own `IpProvider` in production |

## Production checklist

1. **Express:** `app.set('trust proxy', 1)` when behind a load balancer
2. **Redis:** Set `REDIS_URL`; do not rely on in-memory fallback in production
3. **VPN:** Provide `StaticIpProvider`, MaxMind, or IPinfo — not default `IpApiProvider`
4. **Blocking:** Use `guardianMiddleware` with `onAnalyzeError: 'block'`
5. **Per request:** Use `template.fork()` or middleware (never shared Guardian)
6. **Rules:** Define in code only — never load `when()` from user JSON

## Safe usage

- Rules and plugins must be **trusted code**
- Use `await guardian.analyzeAsync(req)` when plugins are installed
- See [MIGRATION.md](./MIGRATION.md) for upgrade paths

## Dependency policy

- Core: no production dependencies
- Plugins: peer-depend on `guardian-risk`; `ioredis` optional for Redis
- CI runs `pnpm audit` on every push
