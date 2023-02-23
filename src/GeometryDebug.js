const createGeometryDebugObject = (element = document) => {
  const debugMode = document.createElement('script');
  debugMode.type = 'application/json';
  debugMode.setAttribute('data-testid', 'debug');
  debugMode.innerText = '{}';

  const debugObject = JSON.parse(debugMode.text);
  const addToDebugObject = (rowId, geometry, geometryType) => {
    debugObject[rowId] = { type: geometryType, coordinates: JSON.parse(geometry) };
  };

  const deleteFromDebugObject = (rowId) => {
    delete debugObject[rowId];
  };
  const saveDebugObject = () => {
    if (!debugMode.isConnected) {
      element.body.appendChild(debugMode);
    }
    debugMode.text = JSON.stringify(debugObject, null, 2);
  };
  return { addToDebugObject, deleteFromDebugObject, saveDebugObject };
};

export default function handleGeometryDisplay(addedNodes, removedNodes, displayStrategy) {
  if (displayStrategy === 'inline') {
    void 0;
  } else if (displayStrategy === 'object') {
    const { addToDebugObject, deleteFromDebugObject, saveDebugObject } = createGeometryDebugObject();
    addedNodes.forEach((node) => {
      if (node.nodeType === 1 && node.matches('[data-id]')) {
        const { id, geometry, geometryType } = node.dataset;
        node.removeAttribute('data-geometry');
        addToDebugObject(id, geometry, geometryType);
      }
    });

    removedNodes.forEach((node) => {
      if (node.nodeType === 1 && node.matches('[data-id]')) {
        const { id } = node.dataset;
        deleteFromDebugObject(id);
      }
    });
    saveDebugObject();
  } else if (displayStrategy === 'none') {
    addedNodes.forEach((node) => {
      if (node.nodeType === 1 && node.matches('[data-id]')) {
        node.removeAttribute('data-geometry');
      }
    });
  }
}
