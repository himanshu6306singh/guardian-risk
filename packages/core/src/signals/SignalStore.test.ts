import { describe, it, expect } from 'vitest';
import { SignalStore } from './SignalStore.js';

describe('SignalStore', () => {
  it('sets and gets signal values', () => {
    const store = new SignalStore();
    store.set('emailVerified', false);
    expect(store.get('emailVerified')).toBe(false);
  });

  it('returns undefined for missing keys', () => {
    const store = new SignalStore();
    expect(store.get('missing')).toBeUndefined();
  });

  it('checks if a signal exists', () => {
    const store = new SignalStore();
    store.set('count', 5);
    expect(store.has('count')).toBe(true);
    expect(store.has('missing')).toBe(false);
  });

  it('overwrites existing signal values', () => {
    const store = new SignalStore();
    store.set('count', 1);
    store.set('count', 2);
    expect(store.get('count')).toBe(2);
  });

  it('returns a frozen snapshot from getAll', () => {
    const store = new SignalStore();
    store.set('a', 1);
    store.set('b', 'test');

    const snapshot = store.getAll();
    expect(snapshot).toEqual({ a: 1, b: 'test' });
    expect(Object.isFrozen(snapshot)).toBe(true);
  });

  it('rejects invalid signal values', () => {
    const store = new SignalStore();
    expect(() => store.set('bad', {} as never)).toThrow(TypeError);
    expect(() => store.set('bad', [] as never)).toThrow(TypeError);
    expect(() => store.set('bad', undefined as never)).toThrow(TypeError);
  });

  it('rejects prototype pollution signal keys', () => {
    const store = new SignalStore();
    expect(() => store.set('__proto__', true)).toThrow(TypeError);
    expect(() => store.set('constructor', true)).toThrow(TypeError);
  });

  it('rejects exceeding max signals', () => {
    const store = new SignalStore();
    for (let i = 0; i < 1000; i++) {
      store.set(`key${i}`, i);
    }
    expect(() => store.set('overflow', 1)).toThrow(RangeError);
  });

  it('uses a prototype-null snapshot', () => {
    const store = new SignalStore();
    store.set('safe', 1);
    const snapshot = store.getAll() as Record<string, unknown>;
    expect(Object.getPrototypeOf(snapshot)).toBeNull();
  });

  it('accepts null as a valid signal value', () => {
    const store = new SignalStore();
    store.set('nullable', null);
    expect(store.get('nullable')).toBeNull();
  });

  it('supports method chaining on set', () => {
    const store = new SignalStore();
    const result = store.set('a', 1).set('b', 2);
    expect(result).toBe(store);
    expect(store.getAll()).toEqual({ a: 1, b: 2 });
  });

  it('clears all signals', () => {
    const store = new SignalStore();
    store.set('a', 1);
    store.clear();
    expect(store.getAll()).toEqual({});
    expect(store.has('a')).toBe(false);
  });
});
