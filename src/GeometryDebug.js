// TODO implement strategy
export default function createGeometryDebugObject(element = document) {
  const debugMode = document.createElement('script');
  debugMode.type = 'application/json';
  debugMode.setAttribute('data-testid', 'debug');
  debugMode.innerText = '{}';
  element.body.appendChild(debugMode);
  const debugObject = JSON.parse(debugMode.text);

  function addToDebugObject(rowId, geometry, geometryType) {
    debugObject[rowId] = { type: geometryType, coordinates: JSON.parse(geometry) };
  }

  function deleteFromDebugObject(rowId) {
    delete debugObject[rowId];
  }
  function saveDebugObject() {
    debugMode.text = JSON.stringify(debugObject, null, 2);
  }
  return { debugMode, addToDebugObject, deleteFromDebugObject, saveDebugObject };
}
