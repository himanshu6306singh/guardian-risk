import { HOOK_TIMEOUT_MS } from '../constants/security.js';

/**
 * Runs hooks sequentially with a per-hook timeout.
 */
export async function runHooks<TContext>(
  hooks: readonly ((context: TContext) => void | Promise<void>)[],
  context: TContext,
  timeoutMs: number = HOOK_TIMEOUT_MS,
): Promise<void> {
  for (const hook of hooks) {
    await runWithTimeout(() => hook(context), timeoutMs);
  }
}

async function runWithTimeout(
  operation: () => void | Promise<void>,
  timeoutMs: number,
): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Guardian analyze hook timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    await Promise.race([Promise.resolve(operation()), timeout]);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}
