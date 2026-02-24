import { describe, it, expect, vi } from 'vitest';
import { makeEventTarget } from '../Hyperleaflet/eventTarget';

describe('makeEventTarget', () => {
  it('adds addEventListener and dispatchEvent to an object', () => {
    const obj = {};
    makeEventTarget(obj);
    expect(typeof obj.addEventListener).toBe('function');
    expect(typeof obj.removeEventListener).toBe('function');
    expect(typeof obj.dispatchEvent).toBe('function');
  });

  it('dispatches events to listeners', () => {
    const obj = {};
    makeEventTarget(obj);
    const handler = vi.fn();
    obj.addEventListener('test', handler);
    obj.dispatchEvent(new Event('test'));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('removes event listeners', () => {
    const obj = {};
    makeEventTarget(obj);
    const handler = vi.fn();
    obj.addEventListener('test', handler);
    obj.removeEventListener('test', handler);
    obj.dispatchEvent(new Event('test'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('supports multiple listeners for the same event', () => {
    const obj = {};
    makeEventTarget(obj);
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    obj.addEventListener('test', handler1);
    obj.addEventListener('test', handler2);
    obj.dispatchEvent(new Event('test'));
    expect(handler1).toHaveBeenCalledOnce();
    expect(handler2).toHaveBeenCalledOnce();
  });

  it('returns true when event is not cancelled', () => {
    const obj = {};
    makeEventTarget(obj);
    const result = obj.dispatchEvent(new Event('test'));
    expect(result).toBe(true);
  });

  it('handles dispatching unknown event types gracefully', () => {
    const obj = {};
    makeEventTarget(obj);
    const result = obj.dispatchEvent(new Event('unknown'));
    expect(result).toBe(true);
  });
});
