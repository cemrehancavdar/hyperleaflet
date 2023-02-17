// TODO implement strategy
export default function createGeometryDebugObject() {
  const debugMode = document.createElement('script');
  debugMode.type = 'application/json';
  debugMode.innerText = '{}';
  document.body.appendChild(debugMode);
  const debugObject = JSON.parse(debugMode.text);
  
  function addToDebugObject(rowId, geometry, geometryType) {
    debugObject[rowId] = { type: geometryType, coordinates: JSON.parse(geometry) };
    debugMode.text = JSON.stringify(debugObject, null, 2);
  }

  function deleteFromDebugObject(rowId) {
    delete debugObject[rowId];
    debugMode.text = JSON.stringify(debugObject, null, 2);
  }
  function saveDebugObject() {
    debugMode.text = JSON.stringify(debugObject, null, 2);
  }
  return { addToDebugObject, deleteFromDebugObject, saveDebugObject };
}
