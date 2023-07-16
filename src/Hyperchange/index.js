/* eslint-disable object-shorthand */
const hyperChangeDetection = {
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
    observeChangesInTarget(targetSelector, uniqueAttribute, attributeFilter);
    this.events[targetSelector] = {};
  },

  /**
   * @param {string} targetSelector
   * @param {'node_adds' | 'node_removes', 'node_changes'} evName
   * @param {(nodes: Node[] | *)=>void} secondFunction
   */
  subscribe: function (targetSelector, evName, secondFunction) {
    this.events[targetSelector][evName] = this.events[targetSelector][evName] || [];
    this.events[targetSelector][evName].push(secondFunction);
  },
  /**
   * @param {string} targetSelector
   * @param {'node_adds' | 'node_removes', 'node_changes'} evName
   * @param {*} fn
   * */
  unsubscribe: function (targetSelector, evName, fn) {
    if (this.events[targetSelector][evName]) {
      this.events[targetSelector][evName] = this.events[targetSelector][evName].filter((f) => f !== fn);
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
window.pubsub = hyperChangeDetection;

/**
 * @param {string} targetSelector
 * @param {string} uniqueAttribute
 * @param {string[]} attributeFilter
 */
function observeChangesInTarget(targetSelector, uniqueAttribute, attributeFilter) {
  const observer = new MutationObserver((mutationsList) => {
    const t0 = performance.now();
    const removedNodes = [];
    const addedNodes = [];
    // Iterate through the mutations
    mutationsList.forEach((mutation) => {
      if (mutation.type === 'childList') {
        // Child nodes added or removed
        removedNodes.push(...findNodesWithAttribute(mutation.removedNodes));
        addedNodes.push(...findNodesWithAttribute(mutation.addedNodes));
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
          hyperChangeDetection.publish(targetSelector, 'node_changes', changedNode);
        }
      }
    });

    const changedNodes = [];
    const removedNodeMap = new Map(removedNodes.map((node) => [node.getAttribute(uniqueAttribute), node]));
    const jointNodeSet = new Set();
    addedNodes.forEach((addNode) => {
      const addNodeId = addNode.getAttribute(uniqueAttribute);
      const oldNode = removedNodeMap.get(addNodeId);
      if (oldNode) {
        jointNodeSet.add(addNodeId);
      }
      if (oldNode && !isEqualNode(oldNode, addNode, attributeFilter)) {
        const attributeChanges = attributeFilter.reduce((changes, attribute) => {
          const from = oldNode.getAttribute(attribute);
          const to = addNode.getAttribute(attribute);

          if (from !== to) {
            changes.push({ attribute, from, to, [uniqueAttribute]: addNodeId });
          }

          return changes;
        }, []);
        changedNodes.push({ ...attributeChanges, dataset: addNode.dataset });
      }
    });

    const reallyRemovedNodes =
      removedNodes.filter((node) => !jointNodeSet.has(node.getAttribute(uniqueAttribute))) ?? [];
    const reallyAddedNodes = addedNodes.filter((node) => !jointNodeSet.has(node.getAttribute(uniqueAttribute))) ?? [];

    if (reallyAddedNodes.length) {
      hyperChangeDetection.publish(targetSelector, 'node_adds', reallyAddedNodes);
    }
    if (changedNodes.length) {
      hyperChangeDetection.publish(targetSelector, 'node_changes', changedNodes);
    }
    if (reallyRemovedNodes.length) {
      hyperChangeDetection.publish(targetSelector, 'node_removes', reallyRemovedNodes);
    }
    const t1 = performance.now();
    console.log(` ${t1 - t0} milliseconds.`);
  });

  const isEqualNode = (oldNode, newNode, attributes) =>
    attributes.every((attribute) => oldNode.getAttribute(attribute) === newNode.getAttribute(attribute));

  function findNodesWithAttribute(nodes) {
    const result = [];
    nodes.forEach((node) => {
      if (node.nodeType === 1) {
        if (node.hasAttribute(uniqueAttribute)) {
          result.push(node);
        }
        result.push(...findNodesWithAttribute(node?.childNodes));
      }
    });
    return result;
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

export default hyperChangeDetection;
