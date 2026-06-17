# Contributing to Guardian

Thank you for your interest in contributing to Guardian.

## Development setup

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
```

## Guidelines

- Keep the core package domain-agnostic (no bot detection logic in core)
- Every public method must be documented with JSDoc
- Maintain 95%+ test coverage on `packages/core`
- No `any` types — use strict TypeScript
- Follow single responsibility: one class, one job

## Pull requests

1. Fork the repository
2. Create a feature branch
3. Add tests for new behavior
4. Ensure `pnpm test` and `pnpm lint` pass
5. Open a pull request with a clear description
