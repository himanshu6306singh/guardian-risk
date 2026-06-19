import type { Guardian } from '../engine/Guardian.js';
import type { RiskReport } from './report.js';

/** Context passed to analyze lifecycle hooks. */
export interface AnalyzeContext<TContext = unknown> {
  /** Caller-provided context (e.g. Express `req`). */
  readonly data: TContext;
  /** Guardian instance being analyzed. */
  readonly guardian: Guardian;
}

/** Context passed to afterAnalyze hooks. */
export interface AfterAnalyzeContext<TContext = unknown> extends AnalyzeContext<TContext> {
  readonly report: RiskReport;
}

/** Runs before signals are evaluated. May be sync or async. */
export type BeforeAnalyzeHook<TContext = unknown> = (
  context: AnalyzeContext<TContext>,
) => void | Promise<void>;

/** Runs after the risk report is built. May be sync or async. */
export type AfterAnalyzeHook<TContext = unknown> = (
  context: AfterAnalyzeContext<TContext>,
) => void | Promise<void>;
