import { parseIpAddress } from 'guardian-risk';

/** Minimal Express request shape — no express import required at runtime. */
export interface ExpressRequestLike {
  readonly ip?: string;
  readonly ips?: readonly string[];
  readonly method?: string;
  readonly path?: string;
  readonly originalUrl?: string;
  readonly headers: Record<string, string | string[] | undefined>;
  readonly socket?: { readonly remoteAddress?: string };
  get?(name: string): string | undefined;
}

/** Options for reading request signals. */
export interface ExpressPluginOptions {
  /**
   * Trust proxy-forwarded IPs (requires `app.set('trust proxy', ...)` in Express).
   */
  readonly trustProxy?: boolean;
}

const MAX_HEADER_LENGTH = 512;

/**
 * Extract HTTP request signals and attach them to a Guardian instance.
 */
export function fromRequest(
  req: ExpressRequestLike,
  guardian: import('guardian-risk').Guardian,
  options: ExpressPluginOptions = {},
): import('guardian-risk').Guardian {
  const { trustProxy = false } = options;
  const clientIp = resolveClientIp(req, trustProxy);
  const userAgent = truncate(readHeader(req, 'user-agent') ?? 'unknown', MAX_HEADER_LENGTH);
  const contentLength = Number(readHeader(req, 'content-length') ?? 0);
  const acceptLanguage = truncate(
    readHeader(req, 'accept-language') ?? 'unknown',
    MAX_HEADER_LENGTH,
  );

  return guardian
    .signal('clientIp', clientIp)
    .signal('userAgent', userAgent)
    .signal('requestMethod', req.method ?? 'UNKNOWN')
    .signal('requestPath', truncate(req.path ?? req.originalUrl ?? '/', MAX_HEADER_LENGTH))
    .signal('contentLength', Number.isFinite(contentLength) ? contentLength : 0)
    .signal('acceptLanguage', acceptLanguage)
    .signal('requestSource', 'express');
}

/**
 * Returns a beforeAnalyze hook that enriches signals from an Express request.
 */
export function expressBeforeAnalyze(
  options: ExpressPluginOptions = {},
): import('guardian-risk').BeforeAnalyzeHook<ExpressRequestLike> {
  return ({ data: req, guardian }) => {
    fromRequest(req, guardian, options);
  };
}

/**
 * Resolve client IP with validation. Spoofed or invalid values are rejected.
 */
export function resolveClientIp(req: ExpressRequestLike, trustProxy: boolean): string {
  if (trustProxy) {
    if (req.ips && req.ips.length > 0) {
      for (const candidate of req.ips) {
        const parsed = parseIpAddress(candidate);
        if (parsed) {
          return parsed;
        }
      }
    }

    const forwarded = readHeader(req, 'x-forwarded-for');
    if (forwarded) {
      for (const part of forwarded.split(',')) {
        const parsed = parseIpAddress(part);
        if (parsed) {
          return parsed;
        }
      }
    }
  }

  const fromReqIp = req.ip ? parseIpAddress(req.ip) : null;
  if (fromReqIp) {
    return fromReqIp;
  }

  const fromSocket = req.socket?.remoteAddress
    ? parseIpAddress(req.socket.remoteAddress)
    : null;
  if (fromSocket) {
    return fromSocket;
  }

  return 'unknown';
}

function readHeader(req: ExpressRequestLike, name: string): string | undefined {
  const fromGetter = req.get?.(name);
  if (fromGetter) {
    return fromGetter;
  }

  const value = req.headers[name.toLowerCase()] ?? req.headers[name];
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function truncate(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value;
}
