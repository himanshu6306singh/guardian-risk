import type { Guardian, RiskReport } from 'guardian-risk';
import type { ExpressRequestLike, ExpressPluginOptions } from './request.js';
import { fromRequest } from './request.js';

/** Express-compatible middleware types (optional peer). */
export interface ExpressRequest extends ExpressRequestLike {
  riskReport?: RiskReport;
  guardian?: Guardian;
}

export type ExpressNextFunction = (error?: unknown) => void;

export interface ExpressResponse {
  status(code: number): ExpressResponse;
  json(body: unknown): void;
}

export type ExpressRequestHandler = (
  req: ExpressRequest,
  res: ExpressResponse,
  next: ExpressNextFunction,
) => void;

export type AnalyzeErrorPolicy = 'pass' | 'block';

export interface GuardianMiddlewareOptions extends ExpressPluginOptions {
  readonly attachToRequest?: boolean;
  /** Block when score is greater than or equal to this threshold. */
  readonly blockAboveScore?: number;
  /**
   * When analysis fails (hook timeout, VPN error), `block` returns 503.
   * Defaults to `block` when `blockAboveScore` is set, otherwise `pass`.
   */
  readonly onAnalyzeError?: AnalyzeErrorPolicy;
  /** Include score/reasons in block response (default: false). */
  readonly exposeBlockDetails?: boolean;
}

export async function analyzeRequest(
  template: Guardian,
  req: ExpressRequestLike,
  options: ExpressPluginOptions = {},
): Promise<{ guardian: Guardian; report: RiskReport }> {
  const guardian = template.fork();

  if (!template.getInstalledPlugins().includes('guardian-risk-express')) {
    fromRequest(req, guardian, options);
  }

  const report = await guardian.analyzeAsync(req);
  return { guardian, report };
}

export function guardianMiddleware(
  template: Guardian,
  options: GuardianMiddlewareOptions = {},
): ExpressRequestHandler {
  const {
    attachToRequest = true,
    blockAboveScore,
    trustProxy = false,
    exposeBlockDetails = false,
  } = options;

  const onAnalyzeError: AnalyzeErrorPolicy =
    options.onAnalyzeError ?? (blockAboveScore !== undefined ? 'block' : 'pass');

  return (req, res, next) => {
    void (async () => {
      try {
        const guardian = template.fork();

        if (!template.getInstalledPlugins().includes('guardian-risk-express')) {
          fromRequest(req, guardian, { trustProxy });
        }

        const report = await guardian.analyzeAsync(req);

        if (attachToRequest) {
          req.guardian = guardian;
          req.riskReport = report;
        }

        if (blockAboveScore !== undefined && report.score >= blockAboveScore) {
          sendBlocked(res, report, exposeBlockDetails);
          return;
        }

        next();
      } catch (error) {
        if (onAnalyzeError === 'block') {
          res.status(503).json({ error: 'Risk analysis unavailable' });
          return;
        }
        next(error);
      }
    })();
  };
}

function sendBlocked(
  res: ExpressResponse,
  report: RiskReport,
  exposeDetails: boolean,
): void {
  if (exposeDetails) {
    res.status(403).json({
      error: 'Request blocked',
      score: report.score,
      level: report.level,
      reasons: report.reasons,
    });
    return;
  }

  res.status(403).json({ error: 'Request blocked' });
}
