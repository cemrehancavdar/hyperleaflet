import { describe, it, expect } from 'vitest';
import { mergeDeep } from '../utils';

describe('mergeDeep', () => {
  it('merges flat objects', () => {
    const result = mergeDeep({ a: 1, b: 2 }, { b: 3, c: 4 });
    expect(result).toEqual({ a: 1, b: 3, c: 4 });
  });

  it('deep merges nested objects', () => {
    const target = { events: { map: { click: true, zoom: false } } };
    const source = { events: { map: { zoom: true } } };
    const result = mergeDeep(target, source);
    expect(result.events.map.click).toBe(true);
    expect(result.events.map.zoom).toBe(true);
  });

  it('does not mutate the target', () => {
    const target = { a: 1, nested: { b: 2 } };
    const source = { nested: { b: 3 } };
    mergeDeep(target, source);
    expect(target.nested.b).toBe(2);
  });

  it('handles arrays as values (replaces, not merges)', () => {
    const result = mergeDeep({ a: [1, 2] }, { a: [3, 4] });
    expect(result.a).toEqual([3, 4]);
  });

  it('adds new nested keys', () => {
    const result = mergeDeep({ a: { b: 1 } }, { a: { c: 2 } });
    expect(result.a).toEqual({ b: 1, c: 2 });
  });
});
