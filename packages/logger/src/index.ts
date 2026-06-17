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
}

/** Options for the logger plugin (stub). */
export interface LoggerPluginOptions {
  /** Minimum level to emit. */
  readonly level?: LogLevel;
  /** Custom sink. Defaults to console. */
  readonly sink?: LogSink;
  /** Log only when score exceeds this threshold. */
  readonly minScore?: number;
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
    });
    console.log(`[guardian-risk] ${payload}`);
  },
};

/**
 * Logger plugin for guardian-risk.
 *
 * @stub Future versions will hook into analyze() automatically.
 * For now, use `logReport()` after `guardian.analyze()`.
 */
export function loggerPlugin(options: LoggerPluginOptions = {}): Plugin {
  const { level = 'info', sink = defaultSink, minScore = 0 } = options;

  return {
    name: 'guardian-risk-logger',
    install(_guardian) {
      void level;
      void sink;
      void minScore;
      // Stub: will wrap analyze() and emit audit logs automatically
    },
  };
}

/**
 * Log a risk report to the configured sink.
 */
export function logReport(
  report: RiskReport,
  options: LoggerPluginOptions = {},
): void {
  const { level = 'info', sink = defaultSink, minScore = 0 } = options;

  if (report.score < minScore) {
    return;
  }

  const entryLevel = resolveLogLevel(report, level);

  sink.write({
    level: entryLevel,
    message: `Risk analysis complete: ${report.level} (${report.score})`,
    report,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Analyze and log in one step.
 */
export function analyzeAndLog(
  guardian: import('guardian-risk').Guardian,
  options: LoggerPluginOptions = {},
): RiskReport {
  const report = guardian.analyze();
  logReport(report, options);
  return report;
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
