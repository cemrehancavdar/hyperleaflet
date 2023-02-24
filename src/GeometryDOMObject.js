const debugMode = document.createElement('script');
debugMode.type = 'application/json';
debugMode.setAttribute('data-testid', 'debug');
debugMode.innerText = '{}';
document.body.appendChild(debugMode);

const debugObject = JSON.parse(debugMode.text);
export function addToDebugObject(node) {
  const { id, geometry, geometryType } = node.dataset;
  node.removeAttribute('data-geometry');
  debugObject[id] = { type: geometryType, coordinates: JSON.parse(geometry) };
  debugMode.text = JSON.stringify(debugObject, null, 2);
}

export function deleteFromDebugObject(node) {
  const { id } = node.dataset;
  delete debugObject[id];
  debugMode.text = JSON.stringify(debugObject, null, 2);
}
