import type { Plugin, RiskReport } from 'guardian-risk';

/** Log severity level. */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** Sink that receives structured log entries. */
export interface LogSink {
  write(entry: LogEntry): void;
}

/** Structured log entry for a risk analysis. */
export interface LogEntry {
  readonly level: LogLevel;
  readonly message: string;
  readonly report: RiskReport;
  readonly timestamp: string;
  readonly context?: unknown;
}

/** Options for the logger plugin. */
export interface LoggerPluginOptions {
  readonly level?: LogLevel;
  readonly sink?: LogSink;
  readonly minScore?: number;
  /** Include redacted request metadata in logs (default: true). */
  readonly includeContext?: boolean;
}

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const defaultSink: LogSink = {
  write(entry): void {
    const payload = JSON.stringify({
      level: entry.level,
      message: entry.message,
      score: entry.report.score,
      riskLevel: entry.report.level,
      matchedRules: entry.report.matchedRules.length,
      timestamp: entry.timestamp,
      ...(entry.context !== undefined ? { context: entry.context } : {}),
    });
    console.log(`[guardian-risk] ${payload}`);
  },
};

export function loggerPlugin(options: LoggerPluginOptions = {}): Plugin {
  const resolved = {
    level: 'info' as LogLevel,
    sink: defaultSink,
    minScore: 0,
    includeContext: true,
    ...options,
  };

  return {
    name: 'guardian-risk-logger',
    install(guardian) {
      guardian.afterAnalyze(({ report, data }) => {
        logReport(report, {
          ...resolved,
          context: resolved.includeContext ? sanitizeLogContext(data) : undefined,
        });
      });
    },
  };
}

export function logReport(
  report: RiskReport,
  options: LoggerPluginOptions & { context?: unknown } = {},
): void {
  const {
    level = 'info',
    sink = defaultSink,
    minScore = 0,
    context,
    includeContext = true,
  } = options;

  if (report.score < minScore) {
    return;
  }

  const entryLevel = resolveLogLevel(report, level);

  if (!shouldLog(level, entryLevel)) {
    return;
  }

  sink.write({
    level: entryLevel,
    message: `Risk analysis: ${report.level} (score ${report.score})`,
    report,
    timestamp: new Date().toISOString(),
    context: includeContext ? sanitizeLogContext(context) : undefined,
  });
}

export async function analyzeAndLog(
  guardian: import('guardian-risk').Guardian,
  context?: unknown,
  options: LoggerPluginOptions = {},
): Promise<RiskReport> {
  const report = await guardian.analyzeAsync(context);
  logReport(report, { ...options, context });
  return report;
}

/** Redact sensitive request fields before logging. */
export function sanitizeLogContext(context: unknown): unknown {
  if (context === null || context === undefined) {
    return undefined;
  }

  if (typeof context !== 'object') {
    return undefined;
  }

  const record = context as Record<string, unknown>;
  return {
    method: typeof record.method === 'string' ? record.method : undefined,
    path:
      typeof record.path === 'string'
        ? record.path
        : typeof record.originalUrl === 'string'
          ? record.originalUrl
          : undefined,
    ip: typeof record.ip === 'string' ? record.ip : undefined,
  };
}

function resolveLogLevel(report: RiskReport, configured: LogLevel): LogLevel {
  if (report.level === 'CRITICAL') {
    return 'error';
  }
  if (report.level === 'HIGH') {
    return 'warn';
  }
  return configured;
}

function shouldLog(configured: LogLevel, actual: LogLevel): boolean {
  return LEVEL_ORDER[actual] >= LEVEL_ORDER[configured];
}

export { shouldLog };
