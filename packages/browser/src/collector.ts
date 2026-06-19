/** Collected behavioral signals from the browser. */
export interface BrowserSignalSnapshot {
  readonly mouseSampleCount: number;
  readonly mouseLinearity: number;
  readonly clickCount: number;
  readonly avgClickIntervalMs: number;
  readonly keyStrokeCount: number;
  readonly hasPointerActivity: boolean;
  readonly collectionDurationMs: number;
}

/** Options for browser signal collection. */
export interface BrowserCollectorOptions {
  /** Max mouse samples to retain. */
  readonly maxMouseSamples?: number;
  /** Target element or document root. */
  readonly target?: EventTarget;
}

interface Point {
  x: number;
  y: number;
  t: number;
}

/**
 * Compute how linear a mouse path is (0 = erratic, 1 = perfectly straight).
 * High values often indicate scripted movement.
 */
export function computeMouseLinearity(points: readonly Point[]): number {
  if (points.length < 3) {
    return 0;
  }

  const first = points[0]!;
  const last = points[points.length - 1]!;

  const straightDistance = distance(first, last);
  if (straightDistance === 0) {
    return 1;
  }

  let pathDistance = 0;
  for (let i = 1; i < points.length; i++) {
    pathDistance += distance(points[i - 1]!, points[i]!);
  }

  if (pathDistance === 0) {
    return 0;
  }

  const linearity = straightDistance / pathDistance;
  return Math.min(1, Math.max(0, linearity));
}

function distance(a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Collects mouse, click, and keyboard behavioral signals in the browser.
 */
export class BrowserCollector {
  private readonly maxMouseSamples: number;
  private readonly target: EventTarget | null;
  private readonly mousePoints: Point[] = [];
  private readonly clickTimes: number[] = [];
  private keyStrokeCount = 0;
  private pointerActivity = false;
  private startedAt = 0;
  private listeners: Array<{ type: string; handler: EventListener }> = [];

  constructor(options: BrowserCollectorOptions = {}) {
    this.maxMouseSamples = options.maxMouseSamples ?? 100;
    this.target = options.target ?? getDefaultTarget();
  }

  /** Start listening for user events. Returns a stop function. */
  start(): () => void {
    if (!this.target) {
      return () => {};
    }

    this.startedAt = Date.now();

    const onMouseMove = (event: Event): void => {
      const e = event as MouseEvent;
      this.mousePoints.push({ x: e.clientX, y: e.clientY, t: Date.now() });
      if (this.mousePoints.length > this.maxMouseSamples) {
        this.mousePoints.shift();
      }
    };

    const onClick = (): void => {
      this.clickTimes.push(Date.now());
    };

    const onKeyDown = (): void => {
      this.keyStrokeCount += 1;
    };

    const onPointer = (): void => {
      this.pointerActivity = true;
    };

    this.addListener('mousemove', onMouseMove);
    this.addListener('click', onClick);
    this.addListener('keydown', onKeyDown);
    this.addListener('pointerdown', onPointer);
    this.addListener('touchstart', onPointer);

    return () => this.stop();
  }

  stop(): void {
    if (!this.target) {
      return;
    }

    for (const { type, handler } of this.listeners) {
      this.target.removeEventListener(type, handler);
    }
    this.listeners = [];
  }

  /** Build a snapshot of collected signals. */
  getSnapshot(): BrowserSignalSnapshot {
    const intervals: number[] = [];
    for (let i = 1; i < this.clickTimes.length; i++) {
      intervals.push(this.clickTimes[i]! - this.clickTimes[i - 1]!);
    }

    const avgClickIntervalMs =
      intervals.length > 0
        ? intervals.reduce((sum, n) => sum + n, 0) / intervals.length
        : 0;

    return {
      mouseSampleCount: this.mousePoints.length,
      mouseLinearity: computeMouseLinearity(this.mousePoints),
      clickCount: this.clickTimes.length,
      avgClickIntervalMs,
      keyStrokeCount: this.keyStrokeCount,
      hasPointerActivity: this.pointerActivity || this.mousePoints.length > 0,
      collectionDurationMs: this.startedAt > 0 ? Date.now() - this.startedAt : 0,
    };
  }

  /** Push collected signals onto a Guardian instance. */
  applyTo(guardian: import('guardian-risk').Guardian): import('guardian-risk').Guardian {
    const snapshot = this.getSnapshot();

    return guardian
      .signal('mouseSampleCount', snapshot.mouseSampleCount)
      .signal('mouseLinearity', round(snapshot.mouseLinearity, 4))
      .signal('clickCount', snapshot.clickCount)
      .signal('avgClickIntervalMs', Math.round(snapshot.avgClickIntervalMs))
      .signal('keyStrokeCount', snapshot.keyStrokeCount)
      .signal('hasPointerActivity', snapshot.hasPointerActivity)
      .signal('collectionDurationMs', snapshot.collectionDurationMs)
      .signal('signalSource', 'browser');
  }

  private addListener(type: string, handler: EventListener): void {
    if (!this.target) {
      return;
    }
    this.target.addEventListener(type, handler, { passive: true });
    this.listeners.push({ type, handler });
  }
}

function getDefaultTarget(): EventTarget | null {
  if (typeof document !== 'undefined') {
    return document;
  }
  return null;
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
