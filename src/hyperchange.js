/**
 * HyperChange — MutationObserver diffing for hypermedia apps.
 *
 * Watches a DOM subtree and emits semantic add/remove/change events
 * by diffing nodes against a unique key attribute. Designed for use
 * with htmx, Turbo, LiveView, or any server-rendered HTML workflow
 * that swaps DOM content and needs to sync with imperative JS libraries.
 *
 * Internal module — not published as a separate package.
 */

const VALID_EVENTS = ['add', 'remove', 'change'];

export class HyperChange {
  /**
   * @param {HTMLElement} root — container element to observe
   * @param {object} options
   * @param {string} options.key — attribute name used as unique identifier (e.g. 'data-id')
   * @param {string[]} [options.watch=[]] — attributes to track for change detection
   * @param {boolean} [options.batch=false] — batch mutations per animation frame
   */
  constructor(root, options) {
    if (!root || !(root instanceof HTMLElement)) {
      throw new Error('HyperChange: root must be an HTMLElement');
    }
    if (!options || !options.key) {
      throw new Error('HyperChange: options.key is required');
    }

    this._root = root;
    this._key = options.key;
    this._watch = options.watch || [];
    this._batch = options.batch || false;
    this._listeners = { add: [], remove: [], change: [] };
    this._frameId = null;
    this._pendingMutations = [];
    this._disconnected = false;

    const hasWatch = this._watch.length > 0;

    this._observer = new MutationObserver((mutations) => {
      if (this._batch) {
        this._pendingMutations.push(...mutations);
        if (this._frameId === null) {
          this._frameId = requestAnimationFrame(() => {
            this._frameId = null;
            const batch = this._pendingMutations.splice(0);
            this._process(batch);
          });
        }
      } else {
        this._process(mutations);
      }
    });

    this._observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: hasWatch,
      attributeFilter: hasWatch ? this._watch : undefined,
      attributeOldValue: hasWatch,
    });
  }

  /**
   * Subscribe to an event.
   * @param {'add'|'remove'|'change'} event
   * @param {function} handler
   * @returns {function} unsubscribe function
   */
  on(event, handler) {
    if (this._disconnected) {
      throw new Error('HyperChange: cannot subscribe after disconnect');
    }
    if (!VALID_EVENTS.includes(event)) {
      throw new Error(
        'HyperChange: invalid event "' + event + '". Must be one of: ' + VALID_EVENTS.join(', ')
      );
    }
    this._listeners[event].push(handler);
    return () => {
      this._listeners[event] = this._listeners[event].filter((h) => h !== handler);
    };
  }

  /**
   * Remove a specific handler.
   * @param {'add'|'remove'|'change'} event
   * @param {function} handler
   */
  off(event, handler) {
    if (this._listeners[event]) {
      this._listeners[event] = this._listeners[event].filter((h) => h !== handler);
    }
  }

  /**
   * Fire 'add' events for all existing keyed children.
   * Useful for initial state — call after setting up handlers.
   */
  scan() {
    const nodes = this._collectKeyedNodes(this._root);
    if (nodes.length > 0) {
      this._emit('add', nodes.map((node) => ({
        node,
        key: node.getAttribute(this._key),
      })));
    }
  }

  /**
   * Stop observing. Clears all listeners. Instance is unusable after this.
   */
  disconnect() {
    this._disconnected = true;
    this._observer.disconnect();
    if (this._frameId !== null) {
      cancelAnimationFrame(this._frameId);
      this._frameId = null;
    }
    this._pendingMutations = [];
    this._listeners = { add: [], remove: [], change: [] };
  }

  // --- Private ---

  /**
   * Iteratively find all elements with the key attribute under a root.
   * Uses a stack instead of recursion to avoid stack overflow on deep trees.
   */
  _collectKeyedNodes(root) {
    const result = [];
    const stack = [];

    // Push root's children onto stack (reverse order so first child is processed first)
    for (let i = root.childNodes.length - 1; i >= 0; i--) {
      stack.push(root.childNodes[i]);
    }

    while (stack.length > 0) {
      const node = stack.pop();
      if (node.nodeType !== 1) continue;
      if (node.hasAttribute(this._key)) result.push(node);
      for (let i = node.childNodes.length - 1; i >= 0; i--) {
        stack.push(node.childNodes[i]);
      }
    }

    return result;
  }

  /**
   * Collect keyed nodes from a NodeList (used for MutationRecord addedNodes/removedNodes).
   */
  _collectKeyedFromNodeList(nodeList) {
    const result = [];
    for (const node of nodeList) {
      if (node.nodeType !== 1) continue;
      if (node.hasAttribute(this._key)) result.push(node);
      // Also check descendants — a parent element may contain keyed children
      const stack = [];
      for (let i = node.childNodes.length - 1; i >= 0; i--) {
        stack.push(node.childNodes[i]);
      }
      while (stack.length > 0) {
        const child = stack.pop();
        if (child.nodeType !== 1) continue;
        if (child.hasAttribute(this._key)) result.push(child);
        for (let i = child.childNodes.length - 1; i >= 0; i--) {
          stack.push(child.childNodes[i]);
        }
      }
    }
    return result;
  }

  /**
   * Process a batch of MutationRecords into semantic add/remove/change events.
   */
  _process(mutations) {
    if (this._disconnected) return;

    const { removed, added, attrChanges } = this._collectFromMutations(mutations);
    const { reallyAdded, reallyRemoved, swapChanges } = this._diff(removed, added);

    const allChanges = attrChanges.length > 0 || swapChanges.length > 0
      ? [...attrChanges, ...swapChanges]
      : [];

    if (reallyAdded.length > 0) this._emit('add', reallyAdded);
    if (reallyRemoved.length > 0) this._emit('remove', reallyRemoved);
    if (allChanges.length > 0) this._emit('change', allChanges);
  }

  /**
   * Extract keyed nodes and attribute changes from raw MutationRecords.
   */
  _collectFromMutations(mutations) {
    const removed = [];
    const added = [];
    const attrChanges = [];

    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        if (mutation.removedNodes.length > 0) {
          removed.push(...this._collectKeyedFromNodeList(mutation.removedNodes));
        }
        if (mutation.addedNodes.length > 0) {
          added.push(...this._collectKeyedFromNodeList(mutation.addedNodes));
        }
      } else if (mutation.type === 'attributes') {
        const target = mutation.target;
        if (!target.hasAttribute(this._key)) continue;
        attrChanges.push({
          node: target,
          key: target.getAttribute(this._key),
          attribute: mutation.attributeName,
          from: mutation.oldValue,
          to: target.getAttribute(mutation.attributeName),
        });
      }
    }

    return { removed, added, attrChanges };
  }

  /**
   * Diff added/removed nodes by key to distinguish real adds/removes
   * from innerHTML swap shuffles where the same key exists in both sets.
   */
  _diff(removed, added) {
    const removedMap = new Map();
    for (const node of removed) {
      const key = node.getAttribute(this._key);
      removedMap.set(key, node);
    }

    const addedMap = new Map();
    for (const node of added) {
      const key = node.getAttribute(this._key);
      addedMap.set(key, node);
    }

    // Keys present in both maps = same item swapped (innerHTML replace)
    const matchedKeys = new Set();
    const swapChanges = [];

    for (const [key, newNode] of addedMap) {
      const oldNode = removedMap.get(key);
      if (!oldNode) continue;

      matchedKeys.add(key);

      // Compare watched attributes between old and new node
      for (const attr of this._watch) {
        const oldVal = oldNode.getAttribute(attr);
        const newVal = newNode.getAttribute(attr);
        if (oldVal !== newVal) {
          swapChanges.push({
            node: newNode,
            key,
            attribute: attr,
            from: oldVal,
            to: newVal,
          });
        }
      }
    }

    const reallyAdded = [];
    for (const [key, node] of addedMap) {
      if (!matchedKeys.has(key)) {
        reallyAdded.push({ node, key });
      }
    }

    const reallyRemoved = [];
    for (const [key, node] of removedMap) {
      if (!matchedKeys.has(key)) {
        reallyRemoved.push({ node, key });
      }
    }

    return { reallyAdded, reallyRemoved, swapChanges };
  }

  /**
   * Emit an event to all listeners, with error isolation.
   */
  _emit(event, entries) {
    for (const handler of this._listeners[event]) {
      try {
        handler(entries);
      } catch (err) {
        console.error('HyperChange: error in "' + event + '" handler:', err);
      }
    }
  }
}
