import type { Plugin } from 'guardian-risk';

/** Options for the browser plugin (stub). */
export interface BrowserPluginOptions {
  /** DOM element to attach behavioral collectors. Defaults to document. */
  readonly container?: string;
}

/**
 * Browser plugin for guardian-risk.
 *
 * @stub Future versions will collect mouse, keyboard, and fingerprint signals
 * in the page and add them to Guardian before analysis.
 */
export function browserPlugin(options: BrowserPluginOptions = {}): Plugin {
  const { container = 'document' } = options;

  return {
    name: 'guardian-risk-browser',
    install(_guardian) {
      void container;
      // Stub: collectors will attach listeners and call guardian.signal()
    },
  };
}

/**
 * @stub Future helper to start client-side signal collection.
 */
export function collectSignals(
  guardian: import('guardian-risk').Guardian,
): import('guardian-risk').Guardian {
  return guardian
    .signal('signalSource', 'browser')
    .signal('browserPlugin', 'stub');
}
