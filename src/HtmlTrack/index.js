/* eslint-disable object-shorthand */
const pubsub = {
  events: {},
  /**
   * @param {string} targetSelector
   * @param {string} uniqueAttribute
   * @param {string[]} attributeFilter
   */
  observe: function ({ targetSelector, uniqueAttribute, attributeFilter }) {
    if (this.events[targetSelector]) {
      throw new Error("Can't observer twice");
    }
    observeDomPart(targetSelector, uniqueAttribute, attributeFilter);
    this.events[targetSelector] = {};
  },

  /**
   * @param {string} targetSelector
   * @param {'node_adds' | 'node_removes', 'node_changes'} evName
   * @param {*} fn
   */
  subscribe: function (targetSelector, evName, fn) {
    this.events[targetSelector][evName] = this.events[targetSelector][evName] || [];
    this.events[targetSelector][evName].push(fn);
  },
  /**
   * @param {string} targetSelector
   * @param {'node_adds' | 'node_removes', 'node_changes'} evName
   * @param {*} fn
   * */
  unsubscribe: function (target, evName, fn) {
    if (this.events[target][evName]) {
      this.events[target][evName] = this.events[target][evName].filter((f) => f !== fn);
    }
  },

  /**
   * @param {string} targetSelector
   * @param {'node_adds' | 'node_removes', 'node_changes'} evName
   * @param {*} data
   */
  publish: function (targetSelector, evName, data) {
    if (this.events[targetSelector][evName]) {
      this.events[targetSelector][evName].forEach((f) => {
        f(data);
      });
    }
  },
};
window.pubsub = pubsub;

/**
 * @param {string} targetSelector
 * @param {string} uniqueAttribute
 * @param {string[]} attributeFilter
 */
function observeDomPart(targetSelector, uniqueAttribute, attributeFilter) {
  const observer = new MutationObserver((mutationsList) => {
    console.time('General Test');

    let removedNodes_ = [];
    let addedNodes_ = [];
    // Iterate through the mutations
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        // Child nodes added or removed
        removedNodes_ = [...removedNodes_, ...logNodes(mutation.removedNodes)];
        addedNodes_ = [...addedNodes_, ...logNodes(mutation.addedNodes)];
      } else if (mutation.type === 'attributes') {
        const attribute = mutation.attributeName;
        const attributeChange = {
          attribute: attribute,
          from: mutation.oldValue,
          to: mutation.target.getAttribute(attribute),
          [uniqueAttribute]: mutation.target.getAttribute(uniqueAttribute),
        };
        const changedNode = [{ node: mutation.target, changes: attributeChange }];
        if (changedNode.length) {
          pubsub.publish(targetSelector, 'node_changes', changedNode);
        }
      }
    }

    const changedNodes = [];
    const removedNodeMap = new Map(removedNodes_.map((node) => [node.getAttribute(uniqueAttribute), node]));
    const jointNodeSet = new Set();
    addedNodes_.forEach((addNode) => {
      const addNodeId = addNode.getAttribute(uniqueAttribute);
      const oldNode = removedNodeMap.get(addNodeId);
      if (oldNode) {
        jointNodeSet.add(addNodeId);
      }
      if (oldNode && !oldNode.isEqualNode(addNode)) {
        const attributeChanges = [];
        for (let attribute of attributeFilter) {
          if (oldNode.getAttribute(attribute) !== addNode.getAttribute(attribute)) {
            attributeChanges.push({
              attribute: attribute,
              from: oldNode.getAttribute(attribute),
              to: addNode.getAttribute(attribute),
              [uniqueAttribute]: addNodeId,
            });
          }
        }
        changedNodes.push({ node: addNode, changes: { ...attributeChanges } });
      }
    });

    const removedNodes = removedNodes_.filter((node) => !jointNodeSet.has(node.getAttribute(uniqueAttribute))) ?? [];
    const addedNodes = addedNodes_.filter((node) => !jointNodeSet.has(node.getAttribute(uniqueAttribute))) ?? [];

    if (addedNodes.length) {
      pubsub.publish(targetSelector, 'node_adds', addedNodes);
    }
    if (changedNodes.length) {
      pubsub.publish(targetSelector, 'node_changes', changedNodes);
    }
    if (removedNodes.length) {
      pubsub.publish(targetSelector, 'node_removes', removedNodes);
    }
    console.timeEnd('General Test');
  });

  function* logNodes(nodes) {
    for (const node of nodes) {
      if (node.nodeType === 1 && node.matches('[data-id]')) {
        yield node;
      }
      yield* logNodes(node?.childNodes);
    }
  }

  // Configuration options for the observer
  const config = {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: attributeFilter,
    attributeOldValue: true,
  };

  const targetNode = document.querySelector(targetSelector);

  observer.observe(targetNode, config);
}

export default pubsub;
