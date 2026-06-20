# Changelog

All notable changes to `guardian-risk` are documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/).

## [0.3.1] - 2026-06-19

### Changed

- Documentation updated for production use — removed outdated "stub" labels
- npm README: production checklist, hardened Express example, full plugin table
- Root README and ECOSYSTEM aligned with published releases
- Plugin packages `@0.2.1` — documentation sync only

## [0.3.0] - 2026-06-18

### Added

- `beforeAnalyze` / `afterAnalyze` lifecycle hooks
- `analyzeAsync(context?)` for async signal collection
- `fork()` — per-request Guardian copies for concurrent HTTP workloads
- `defineSignals<T>()` — typed signal keys and rule predicates
- `ruleGroup({ name, maxScore, rules })` — cap combined group scores
- `applyRules()`, `botDetectionRules`, `loginProtectionRules` presets
- **guardian-risk-express** `0.2.0`: `fromRequest`, `guardianMiddleware`, `analyzeRequest`
- **guardian-risk-redis** `0.2.0`: session counters, `RedisSessionStore`, `createRedisStore()` (ioredis optional)
- **guardian-risk-vpn** `0.2.0`: `checkIp`, `StaticIpProvider`, `IpApiProvider` (dev only)
- **guardian-risk-logger** `0.2.0`: auto-logging via `afterAnalyze` hook
- **guardian-risk-browser** `0.2.0`: `BrowserCollector`, mouse linearity, pointer/touch activity
- `examples/express-api/` — full Express middleware demo
- `MIGRATION.md` upgrade guide

### Security

- Validate IP addresses; reject spoofed XFF values
- Cap string signal length; reject `NaN`/`Infinity` numbers
- Deep-freeze matched rules in reports
- Lock rule/plugin registration during `analyzeAsync()`
- Hook timeout (10s) per lifecycle hook
- Express: fail-closed middleware, safe block responses, `>=` threshold
- Redis: session ID sanitization, IP fallback rate limit, fail-loud Redis connect
- VPN: reuse `clientIp` signal, HTTPS + timeout, no default external provider
- Logger: redact request context in logs

### Breaking

- Plugins register hooks — use `analyzeAsync()` instead of `analyze()` when plugins are installed
- `analyzeAndLog()` is async
- Stub plugin signals removed; plugins set real signals (`clientIp`, `userAgent`, etc.)

## [0.2.1] - 2026-06-18

### Security

- Bound per-rule scores to ±10,000 and clamp total score to ±1,000,000
- Validate rule `reason` and `description` string lengths
- Isolate plugin `install()` failures with `PluginInstallError`
- Upgrade dev dependencies (vitest 4.x) — zero runtime dependency change

### Added

- npm provenance release workflow (`.github/workflows/release.yml`)
- `security` and `funding` fields in package metadata
- `CODE_OF_CONDUCT.md`, `CODEOWNERS`

## [0.2.0] - 2026-06-17

### Added

- Plugin system: `guardian.use(plugin)`, `Plugin` / `GuardianPlugin` interface
- `PluginRegistry` with duplicate-plugin protection
- `getInstalledPlugins()` API
- Security hardening: signal key validation, prototype pollution guards, rule limits
- Official plugin stubs: express, browser, redis, vpn, logger

### Security

- Block `__proto__`, `constructor`, `prototype` signal keys
- Prototype-null signal snapshots
- Validate rules, plugins, and risk level config
- Catch errors in rule `when()` callbacks
- Max 1,000 signals / 1,000 rules per Guardian instance

## [0.1.0] - 2026-06-17

### Added

- Initial release: signals, rules, scoring, immutable reports
- Fluent `Guardian` API
- Configurable risk levels
- Zero runtime dependencies

[0.3.1]: https://github.com/himanshu6306singh/guardian-risk/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/himanshu6306singh/guardian-risk/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/himanshu6306singh/guardian-risk/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/himanshu6306singh/guardian-risk/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/himanshu6306singh/guardian-risk/releases/tag/v0.1.0
