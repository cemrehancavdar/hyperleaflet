// TODO implement strategy
const createGeometryDebugObject = (element = document) => {
  const debugMode = document.createElement('script');
  debugMode.type = 'application/json';
  debugMode.setAttribute('data-testid', 'debug');
  debugMode.innerText = '{}';
  element.body.appendChild(debugMode);
  const debugObject = JSON.parse(debugMode.text);

  const addToDebugObject = (rowId, geometry, geometryType) => {
    debugObject[rowId] = { type: geometryType, coordinates: JSON.parse(geometry) };
  };

  const deleteFromDebugObject = (rowId) => {
    delete debugObject[rowId];
  };
  const saveDebugObject = () => {
    debugMode.text = JSON.stringify(debugObject, null, 2);
  };
  return { debugMode, addToDebugObject, deleteFromDebugObject, saveDebugObject };
};

export default function handleGeometryDisplay(addedNodes, removedNodes, displayStrategy) {
  console.log(displayStrategy);
  if (displayStrategy === 'inline') {
    return;
  }

  const { addToDebugObject, deleteFromDebugObject, saveDebugObject } = createGeometryDebugObject();

  addedNodes.forEach((node) => {
    if (node.nodeType === 1 && node.matches('[data-id]')) {
      const { id, geometry, geometryType } = node.dataset;
      node.removeAttribute('data-geometry');
      if (displayStrategy === 'object') {
        addToDebugObject(id, geometry, geometryType);
      }
    }
  });

  removedNodes.forEach((node) => {
    if (node.nodeType === 1 && node.matches('[data-id]')) {
      const { id } = node.dataset;
      deleteFromDebugObject(id);
    }
  });

  saveDebugObject();
}
