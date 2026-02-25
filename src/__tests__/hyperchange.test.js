import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HyperChange } from '../hyperchange';

/**
 * Helper: wait for MutationObserver to flush.
 * MutationObserver callbacks are microtasks — awaiting a resolved promise
 * plus setTimeout(0) ensures they run before assertions.
 */
function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('HyperChange', () => {
  let root;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  afterEach(() => {
    root.remove();
  });

  // --- Constructor ---

  describe('constructor', () => {
    it('throws if root is not an HTMLElement', () => {
      expect(() => new HyperChange(null, { key: 'data-id' })).toThrow('root must be an HTMLElement');
      expect(() => new HyperChange('div', { key: 'data-id' })).toThrow('root must be an HTMLElement');
    });

    it('throws if key is not provided', () => {
      expect(() => new HyperChange(root, {})).toThrow('options.key is required');
      expect(() => new HyperChange(root)).toThrow();
    });

    it('creates an instance without errors', () => {
      const hc = new HyperChange(root, { key: 'data-id' });
      expect(hc).toBeDefined();
      hc.disconnect();
    });
  });

  // --- Add events ---

  describe('add', () => {
    it('fires when a keyed element is appended', async () => {
      const handler = vi.fn();
      const hc = new HyperChange(root, { key: 'data-id' });
      hc.on('add', handler);

      const el = document.createElement('div');
      el.setAttribute('data-id', 'item-1');
      root.appendChild(el);

      await flush();
      expect(handler).toHaveBeenCalledOnce();
      expect(handler.mock.calls[0][0]).toEqual([
        { node: el, key: 'item-1' },
      ]);

      hc.disconnect();
    });

    it('fires for multiple elements added at once', async () => {
      const handler = vi.fn();
      const hc = new HyperChange(root, { key: 'data-id' });
      hc.on('add', handler);

      const frag = document.createDocumentFragment();
      const el1 = document.createElement('div');
      el1.setAttribute('data-id', 'a');
      const el2 = document.createElement('div');
      el2.setAttribute('data-id', 'b');
      frag.appendChild(el1);
      frag.appendChild(el2);
      root.appendChild(frag);

      await flush();
      expect(handler).toHaveBeenCalledOnce();
      const entries = handler.mock.calls[0][0];
      expect(entries).toHaveLength(2);
      expect(entries.map((e) => e.key)).toEqual(['a', 'b']);

      hc.disconnect();
    });

    it('finds nested keyed elements', async () => {
      const handler = vi.fn();
      const hc = new HyperChange(root, { key: 'data-id' });
      hc.on('add', handler);

      // <table><tbody><tr data-id="1"></tr></tbody></table>
      const table = document.createElement('table');
      const tbody = document.createElement('tbody');
      const tr = document.createElement('tr');
      tr.setAttribute('data-id', '1');
      tbody.appendChild(tr);
      table.appendChild(tbody);
      root.appendChild(table);

      await flush();
      expect(handler).toHaveBeenCalledOnce();
      expect(handler.mock.calls[0][0][0].key).toBe('1');

      hc.disconnect();
    });

    it('ignores elements without the key attribute', async () => {
      const handler = vi.fn();
      const hc = new HyperChange(root, { key: 'data-id' });
      hc.on('add', handler);

      const el = document.createElement('div');
      el.className = 'no-key';
      root.appendChild(el);

      await flush();
      expect(handler).not.toHaveBeenCalled();

      hc.disconnect();
    });
  });

  // --- Remove events ---

  describe('remove', () => {
    it('fires when a keyed element is removed', async () => {
      const el = document.createElement('div');
      el.setAttribute('data-id', 'item-1');
      root.appendChild(el);

      const handler = vi.fn();
      const hc = new HyperChange(root, { key: 'data-id' });
      hc.on('remove', handler);

      // Need to flush the add first
      await flush();

      el.remove();
      await flush();

      expect(handler).toHaveBeenCalledOnce();
      expect(handler.mock.calls[0][0][0].key).toBe('item-1');

      hc.disconnect();
    });
  });

  // --- innerHTML swap (the critical case) ---

  describe('innerHTML swap', () => {
    it('detects new items added via innerHTML', async () => {
      root.innerHTML = '<div data-id="1">old</div>';
      const addHandler = vi.fn();
      const removeHandler = vi.fn();
      const hc = new HyperChange(root, { key: 'data-id' });
      hc.on('add', addHandler);
      hc.on('remove', removeHandler);

      // Swap: remove old "1", add new "1" + new "2"
      root.innerHTML = '<div data-id="1">new</div><div data-id="2">brand new</div>';

      await flush();
      // "1" appears in both added and removed -> matched, not a real add/remove
      // "2" only in added -> real add
      expect(addHandler).toHaveBeenCalledOnce();
      expect(addHandler.mock.calls[0][0]).toHaveLength(1);
      expect(addHandler.mock.calls[0][0][0].key).toBe('2');

      // "1" was matched, so no remove. No items only in removed.
      expect(removeHandler).not.toHaveBeenCalled();

      hc.disconnect();
    });

    it('detects items removed via innerHTML', async () => {
      root.innerHTML = '<div data-id="1">a</div><div data-id="2">b</div><div data-id="3">c</div>';
      const addHandler = vi.fn();
      const removeHandler = vi.fn();
      const hc = new HyperChange(root, { key: 'data-id' });
      hc.on('add', addHandler);
      hc.on('remove', removeHandler);

      // Swap: keep "1", remove "2" and "3"
      root.innerHTML = '<div data-id="1">a</div>';

      await flush();
      expect(addHandler).not.toHaveBeenCalled();
      expect(removeHandler).toHaveBeenCalledOnce();
      const removedKeys = removeHandler.mock.calls[0][0].map((e) => e.key);
      expect(removedKeys).toEqual(expect.arrayContaining(['2', '3']));
      expect(removedKeys).toHaveLength(2);

      hc.disconnect();
    });

    it('detects attribute changes during innerHTML swap', async () => {
      root.innerHTML = '<div data-id="1" data-value="old">a</div>';
      const changeHandler = vi.fn();
      const hc = new HyperChange(root, { key: 'data-id', watch: ['data-value'] });
      hc.on('change', changeHandler);

      // Swap: same key, different watched attribute
      root.innerHTML = '<div data-id="1" data-value="new">a</div>';

      await flush();
      expect(changeHandler).toHaveBeenCalledOnce();
      const change = changeHandler.mock.calls[0][0][0];
      expect(change.key).toBe('1');
      expect(change.attribute).toBe('data-value');
      expect(change.from).toBe('old');
      expect(change.to).toBe('new');

      hc.disconnect();
    });

    it('produces no events when innerHTML swap is identical', async () => {
      root.innerHTML = '<div data-id="1" data-value="same">a</div>';
      const addHandler = vi.fn();
      const removeHandler = vi.fn();
      const changeHandler = vi.fn();
      const hc = new HyperChange(root, { key: 'data-id', watch: ['data-value'] });
      hc.on('add', addHandler);
      hc.on('remove', removeHandler);
      hc.on('change', changeHandler);

      // Identical swap
      root.innerHTML = '<div data-id="1" data-value="same">a</div>';

      await flush();
      expect(addHandler).not.toHaveBeenCalled();
      expect(removeHandler).not.toHaveBeenCalled();
      expect(changeHandler).not.toHaveBeenCalled();

      hc.disconnect();
    });

    it('handles full swap: some added, some removed, some changed', async () => {
      root.innerHTML =
        '<div data-id="1" data-value="a">keep</div>' +
        '<div data-id="2" data-value="b">remove</div>' +
        '<div data-id="3" data-value="c">change</div>';

      const addHandler = vi.fn();
      const removeHandler = vi.fn();
      const changeHandler = vi.fn();
      const hc = new HyperChange(root, { key: 'data-id', watch: ['data-value'] });
      hc.on('add', addHandler);
      hc.on('remove', removeHandler);
      hc.on('change', changeHandler);

      // Swap: keep "1" (same), remove "2", change "3" value, add "4"
      root.innerHTML =
        '<div data-id="1" data-value="a">keep</div>' +
        '<div data-id="3" data-value="changed">changed</div>' +
        '<div data-id="4" data-value="d">new</div>';

      await flush();

      // "4" is genuinely new
      expect(addHandler).toHaveBeenCalledOnce();
      expect(addHandler.mock.calls[0][0][0].key).toBe('4');

      // "2" is genuinely gone
      expect(removeHandler).toHaveBeenCalledOnce();
      expect(removeHandler.mock.calls[0][0][0].key).toBe('2');

      // "3" matched but data-value changed
      expect(changeHandler).toHaveBeenCalledOnce();
      const change = changeHandler.mock.calls[0][0][0];
      expect(change.key).toBe('3');
      expect(change.attribute).toBe('data-value');
      expect(change.from).toBe('c');
      expect(change.to).toBe('changed');

      hc.disconnect();
    });
  });

  // --- Direct attribute mutations ---

  describe('attribute changes', () => {
    it('detects direct setAttribute on watched attributes', async () => {
      const el = document.createElement('div');
      el.setAttribute('data-id', '1');
      el.setAttribute('data-geo', '[0, 0]');
      root.appendChild(el);

      const changeHandler = vi.fn();
      const hc = new HyperChange(root, { key: 'data-id', watch: ['data-geo'] });
      hc.on('change', changeHandler);

      await flush(); // flush the add

      el.setAttribute('data-geo', '[1, 1]');

      await flush();
      expect(changeHandler).toHaveBeenCalledOnce();
      const change = changeHandler.mock.calls[0][0][0];
      expect(change.key).toBe('1');
      expect(change.attribute).toBe('data-geo');
      expect(change.from).toBe('[0, 0]');
      expect(change.to).toBe('[1, 1]');

      hc.disconnect();
    });

    it('ignores attribute changes on elements without key', async () => {
      const el = document.createElement('div');
      el.setAttribute('data-geo', '[0, 0]');
      root.appendChild(el);

      const changeHandler = vi.fn();
      const hc = new HyperChange(root, { key: 'data-id', watch: ['data-geo'] });
      hc.on('change', changeHandler);

      await flush();

      el.setAttribute('data-geo', '[1, 1]');

      await flush();
      expect(changeHandler).not.toHaveBeenCalled();

      hc.disconnect();
    });

    it('ignores unwatched attribute changes', async () => {
      const el = document.createElement('div');
      el.setAttribute('data-id', '1');
      el.setAttribute('data-geo', '[0, 0]');
      root.appendChild(el);

      // Only watching data-geo, not data-popup
      const changeHandler = vi.fn();
      const hc = new HyperChange(root, { key: 'data-id', watch: ['data-geo'] });
      hc.on('change', changeHandler);

      await flush();

      el.setAttribute('data-popup', 'hello');

      await flush();
      expect(changeHandler).not.toHaveBeenCalled();

      hc.disconnect();
    });
  });

  // --- scan() ---

  describe('scan', () => {
    it('fires add events for existing keyed children', () => {
      root.innerHTML =
        '<div data-id="1">a</div><div data-id="2">b</div><div>no key</div>';

      const handler = vi.fn();
      const hc = new HyperChange(root, { key: 'data-id' });
      hc.on('add', handler);
      hc.scan();

      // Synchronous — fires immediately
      expect(handler).toHaveBeenCalledOnce();
      const entries = handler.mock.calls[0][0];
      expect(entries).toHaveLength(2);
      expect(entries.map((e) => e.key)).toEqual(['1', '2']);

      hc.disconnect();
    });

    it('returns nothing if no keyed children exist', () => {
      const handler = vi.fn();
      const hc = new HyperChange(root, { key: 'data-id' });
      hc.on('add', handler);
      hc.scan();

      expect(handler).not.toHaveBeenCalled();

      hc.disconnect();
    });
  });

  // --- on() returns unsubscribe ---

  describe('on / off', () => {
    it('on() returns an unsubscribe function', async () => {
      const handler = vi.fn();
      const hc = new HyperChange(root, { key: 'data-id' });
      const unsub = hc.on('add', handler);

      const el = document.createElement('div');
      el.setAttribute('data-id', '1');
      root.appendChild(el);
      await flush();
      expect(handler).toHaveBeenCalledOnce();

      // Unsubscribe
      unsub();

      const el2 = document.createElement('div');
      el2.setAttribute('data-id', '2');
      root.appendChild(el2);
      await flush();
      // Should NOT fire again
      expect(handler).toHaveBeenCalledOnce();

      hc.disconnect();
    });

    it('off() removes a handler', async () => {
      const handler = vi.fn();
      const hc = new HyperChange(root, { key: 'data-id' });
      hc.on('add', handler);
      hc.off('add', handler);

      const el = document.createElement('div');
      el.setAttribute('data-id', '1');
      root.appendChild(el);
      await flush();
      expect(handler).not.toHaveBeenCalled();

      hc.disconnect();
    });

    it('throws for invalid event names', () => {
      const hc = new HyperChange(root, { key: 'data-id' });
      expect(() => hc.on('invalid', () => {})).toThrow('invalid event');
      hc.disconnect();
    });
  });

  // --- disconnect ---

  describe('disconnect', () => {
    it('stops emitting events after disconnect', async () => {
      const handler = vi.fn();
      const hc = new HyperChange(root, { key: 'data-id' });
      hc.on('add', handler);
      hc.disconnect();

      const el = document.createElement('div');
      el.setAttribute('data-id', '1');
      root.appendChild(el);
      await flush();

      expect(handler).not.toHaveBeenCalled();
    });
  });

  // --- Error isolation ---

  describe('error isolation', () => {
    it('one bad handler does not prevent others from firing', async () => {
      const badHandler = vi.fn(() => {
        throw new Error('boom');
      });
      const goodHandler = vi.fn();

      const hc = new HyperChange(root, { key: 'data-id' });
      hc.on('add', badHandler);
      hc.on('add', goodHandler);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const el = document.createElement('div');
      el.setAttribute('data-id', '1');
      root.appendChild(el);
      await flush();

      expect(badHandler).toHaveBeenCalledOnce();
      expect(goodHandler).toHaveBeenCalledOnce();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      hc.disconnect();
    });
  });

  // --- Custom key attributes ---

  describe('custom key attribute', () => {
    it('works with non-standard key attributes', async () => {
      const handler = vi.fn();
      const hc = new HyperChange(root, { key: 'data-key' });
      hc.on('add', handler);

      const el = document.createElement('div');
      el.setAttribute('data-key', 'abc');
      root.appendChild(el);

      await flush();
      expect(handler).toHaveBeenCalledOnce();
      expect(handler.mock.calls[0][0][0].key).toBe('abc');

      hc.disconnect();
    });
  });

  // --- on() after disconnect ---

  describe('on after disconnect', () => {
    it('throws if subscribing after disconnect', () => {
      const hc = new HyperChange(root, { key: 'data-id' });
      hc.disconnect();
      expect(() => hc.on('add', () => {})).toThrow('cannot subscribe after disconnect');
    });
  });

  // --- Nested keyed elements ---

  describe('nested keyed elements', () => {
    it('fires remove for parent and nested keyed children when parent is removed', async () => {
      root.innerHTML =
        '<div data-id="parent"><div data-id="child">nested</div></div>';

      const removeHandler = vi.fn();
      const hc = new HyperChange(root, { key: 'data-id' });
      hc.on('remove', removeHandler);

      await flush();

      // Remove the parent — both parent and child should fire
      root.innerHTML = '';

      await flush();
      expect(removeHandler).toHaveBeenCalledOnce();
      const keys = removeHandler.mock.calls[0][0].map((e) => e.key);
      expect(keys).toContain('parent');
      expect(keys).toContain('child');
      expect(keys).toHaveLength(2);

      hc.disconnect();
    });

    it('scan finds deeply nested keyed elements', () => {
      root.innerHTML =
        '<table><tbody><tr data-id="1"><td>a</td></tr><tr data-id="2"><td>b</td></tr></tbody></table>';

      const handler = vi.fn();
      const hc = new HyperChange(root, { key: 'data-id' });
      hc.on('add', handler);
      hc.scan();

      expect(handler).toHaveBeenCalledOnce();
      expect(handler.mock.calls[0][0]).toHaveLength(2);
      expect(handler.mock.calls[0][0].map((e) => e.key)).toEqual(['1', '2']);

      hc.disconnect();
    });
  });

  // --- Multiple watched attributes ---

  describe('multiple watched attributes', () => {
    it('detects changes to multiple attributes in one innerHTML swap', async () => {
      root.innerHTML = '<div data-id="1" data-x="0" data-y="0">origin</div>';

      const changeHandler = vi.fn();
      const hc = new HyperChange(root, { key: 'data-id', watch: ['data-x', 'data-y'] });
      hc.on('change', changeHandler);

      root.innerHTML = '<div data-id="1" data-x="10" data-y="20">moved</div>';

      await flush();
      expect(changeHandler).toHaveBeenCalledOnce();
      const changes = changeHandler.mock.calls[0][0];
      expect(changes).toHaveLength(2);

      const xChange = changes.find((c) => c.attribute === 'data-x');
      const yChange = changes.find((c) => c.attribute === 'data-y');
      expect(xChange.from).toBe('0');
      expect(xChange.to).toBe('10');
      expect(yChange.from).toBe('0');
      expect(yChange.to).toBe('20');

      hc.disconnect();
    });

    it('only reports attributes that actually changed', async () => {
      root.innerHTML = '<div data-id="1" data-x="0" data-y="0">origin</div>';

      const changeHandler = vi.fn();
      const hc = new HyperChange(root, { key: 'data-id', watch: ['data-x', 'data-y'] });
      hc.on('change', changeHandler);

      // Only change data-x, keep data-y the same
      root.innerHTML = '<div data-id="1" data-x="10" data-y="0">moved</div>';

      await flush();
      expect(changeHandler).toHaveBeenCalledOnce();
      const changes = changeHandler.mock.calls[0][0];
      expect(changes).toHaveLength(1);
      expect(changes[0].attribute).toBe('data-x');

      hc.disconnect();
    });
  });
});
