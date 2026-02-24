const hyperChangeDetection = {
  events: {},

  /** @param {{ targetSelector: string, uniqueAttribute: string, attributeFilter: string[] }} options */
  observe({ targetSelector, uniqueAttribute, attributeFilter }) {
    if (this.events[targetSelector]) {
      throw new Error("Can't observe the same target twice");
    }
    observeChangesInTarget(targetSelector, uniqueAttribute, attributeFilter);
    this.events[targetSelector] = {};
  },

  /** @param {string} targetSelector @param {string} evName @param {Function} callback */
  subscribe(targetSelector, evName, callback) {
    this.events[targetSelector][evName] = this.events[targetSelector][evName] || [];
    this.events[targetSelector][evName].push(callback);
  },

  /** @param {string} targetSelector @param {string} evName @param {Function} callback */
  unsubscribe(targetSelector, evName, callback) {
    if (this.events[targetSelector][evName]) {
      this.events[targetSelector][evName] = this.events[targetSelector][evName].filter((f) => f !== callback);
    }
  },

  /** @param {string} targetSelector @param {string} evName @param {*} data */
  publish(targetSelector, evName, data) {
    if (this.events[targetSelector][evName]) {
      this.events[targetSelector][evName].forEach((f) => f(data));
    }
  },
};

function observeChangesInTarget(targetSelector, uniqueAttribute, attributeFilter) {
  const isEqualNode = (oldNode, newNode, attributes) =>
    attributes.every((attribute) => oldNode.getAttribute(attribute) === newNode.getAttribute(attribute));

  function findNodesWithAttribute(nodes) {
    const result = [];
    nodes.forEach((node) => {
      if (node.nodeType === 1) {
        if (node.hasAttribute(uniqueAttribute)) {
          result.push(node);
        }
        result.push(...findNodesWithAttribute(node.childNodes));
      }
    });
    return result;
  }

  const observer = new MutationObserver((mutationsList) => {
    const removedNodes = [];
    const addedNodes = [];

    mutationsList.forEach((mutation) => {
      if (mutation.type === 'childList') {
        removedNodes.push(...findNodesWithAttribute(mutation.removedNodes));
        addedNodes.push(...findNodesWithAttribute(mutation.addedNodes));
      } else if (mutation.type === 'attributes') {
        const attribute = mutation.attributeName;
        const attributeChange = {
          attribute,
          from: mutation.oldValue,
          to: mutation.target.getAttribute(attribute),
          [uniqueAttribute]: mutation.target.getAttribute(uniqueAttribute),
        };
        const changedNode = [{ dataset: mutation.target.dataset, ...attributeChange }];
        hyperChangeDetection.publish(targetSelector, 'node_changes', changedNode);
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
        const attributeChanges = attributeFilter.reduce((changes, attr) => {
          const from = oldNode.getAttribute(attr);
          const to = addNode.getAttribute(attr);
          if (from !== to) {
            changes.push({ attribute: attr, from, to, [uniqueAttribute]: addNodeId });
          }
          return changes;
        }, []);
        changedNodes.push({ ...attributeChanges, dataset: addNode.dataset });
      }
    });

    const reallyRemovedNodes = removedNodes.filter((node) => !jointNodeSet.has(node.getAttribute(uniqueAttribute)));
    const reallyAddedNodes = addedNodes.filter((node) => !jointNodeSet.has(node.getAttribute(uniqueAttribute)));

    if (reallyAddedNodes.length) {
      hyperChangeDetection.publish(targetSelector, 'node_adds', reallyAddedNodes);
    }
    if (changedNodes.length) {
      hyperChangeDetection.publish(targetSelector, 'node_changes', changedNodes);
    }
    if (reallyRemovedNodes.length) {
      hyperChangeDetection.publish(targetSelector, 'node_removes', reallyRemovedNodes);
    }
  });

  const targetNode = document.querySelector(targetSelector);
  observer.observe(targetNode, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter,
    attributeOldValue: true,
  });
}

export default hyperChangeDetection;
