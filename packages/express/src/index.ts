import type { Plugin } from 'guardian-risk';

/** Options for the Express plugin (stub). */
export interface ExpressPluginOptions {
  /** Trust X-Forwarded-* headers when reading client IP. */
  readonly trustProxy?: boolean;
}

/**
 * Express plugin for guardian-risk.
 *
 * @stub This plugin is a stub. Future versions will read Express requests
 * and add signals such as `clientIp`, `userAgent`, `requestMethod`, and
 * `requestsPerMinute`.
 */
export function expressPlugin(options: ExpressPluginOptions = {}): Plugin {
  const { trustProxy = false } = options;

  return {
    name: 'guardian-risk-express',
    install(_guardian) {
      void trustProxy;
      // Stub: middleware will attach signals from req before analyze()
    },
  };
}

/**
 * @stub Future middleware that enriches a Guardian instance from an Express request.
 */
export function fromRequest(
  _req: unknown,
  guardian: import('guardian-risk').Guardian,
): import('guardian-risk').Guardian {
  return guardian
    .signal('requestSource', 'express')
    .signal('expressPlugin', 'stub');
}
