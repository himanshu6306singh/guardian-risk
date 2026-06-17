/** Primitive signal value types supported by Guardian. */
export type SignalValue = string | number | boolean | null;

/** Read-only map of signal key to value. */
export type SignalMap = Readonly<Record<string, SignalValue>>;

/** Definition of a single signal. */
export interface SignalDefinition<T extends SignalValue = SignalValue> {
  readonly key: string;
  readonly value: T;
}
