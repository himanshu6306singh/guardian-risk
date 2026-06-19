import { describe, it, expect, vi } from 'vitest';
import { runHooks } from './runHooks.js';

describe('runHooks', () => {
  it('runs hooks in order', async () => {
    const order: number[] = [];

    await runHooks(
      [
        () => {
          order.push(1);
        },
        async () => {
          await Promise.resolve();
          order.push(2);
        },
        () => {
          order.push(3);
        },
      ],
      {},
    );

    expect(order).toEqual([1, 2, 3]);
  });

  it('awaits async hooks before continuing', async () => {
    const spy = vi.fn();

    await runHooks(
      [
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          spy('done');
        },
      ],
      {},
    );

    expect(spy).toHaveBeenCalledWith('done');
  });

  it('rejects hooks that exceed the timeout', async () => {
    vi.useFakeTimers();

    const slow = runHooks(
      [
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 20_000));
        },
      ],
      {},
      50,
    );

    const assertion = expect(slow).rejects.toThrow(/timed out/);
    await vi.advanceTimersByTimeAsync(60);
    await assertion;

    vi.useRealTimers();
  });
});
