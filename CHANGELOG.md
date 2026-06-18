# Changelog

All notable changes to `guardian-risk` are documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/).

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

[0.2.1]: https://github.com/himanshu6306singh/guardian-risk/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/himanshu6306singh/guardian-risk/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/himanshu6306singh/guardian-risk/releases/tag/v0.1.0
