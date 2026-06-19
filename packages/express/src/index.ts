import type { Plugin } from 'guardian-risk';
import type { ExpressPluginOptions } from './request.js';
import { expressBeforeAnalyze } from './request.js';

export type { ExpressRequestLike, ExpressPluginOptions } from './request.js';
export { fromRequest, expressBeforeAnalyze, resolveClientIp } from './request.js';

export type {
  ExpressRequest,
  ExpressResponse,
  ExpressNextFunction,
  ExpressRequestHandler,
  GuardianMiddlewareOptions,
  AnalyzeErrorPolicy,
} from './middleware.js';
export { analyzeRequest, guardianMiddleware } from './middleware.js';

/** Options for the Express plugin. */
export type ExpressPluginConfig = ExpressPluginOptions;

/**
 * Express plugin — registers a beforeAnalyze hook for request signal collection.
 *
 * Usage with middleware (recommended):
 * ```typescript
 * app.use(guardianMiddleware(template, { trustProxy: true }));
 * ```
 *
 * Or manual:
 * ```typescript
 * const g = template.fork().use(expressPlugin({ trustProxy: true }));
 * const report = await g.analyzeAsync(req);
 * ```
 */
export function expressPlugin(options: ExpressPluginConfig = {}): Plugin {
  const hook = expressBeforeAnalyze(options);

  return {
    name: 'guardian-risk-express',
    install(guardian) {
      guardian.beforeAnalyze(hook);
    },
  };
}
