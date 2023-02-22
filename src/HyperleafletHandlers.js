import createLeafletObject from './Geometry';
import createGeometryDebugObject from './GeometryDebug';

const leafletObjectMap = new Map();

function addNodeToHyperleaflet(node) {
  const { dataset } = node;
  const rowId = dataset.id;

  if (rowId in leafletObjectMap) {
    // eslint-disable-next-line no-console
    console.error(`%c${rowId}`, 'color:red', 'already exists', node);
    return [];
  }

  const leafletObject = createLeafletObject({ ...dataset });
  leafletObjectMap.set(rowId, leafletObject);

  return [leafletObject, rowId, dataset.geometry, dataset.geometryType];
}

function deleteNodeFromHyperleaflet(node) {
  const rowId = node.dataset.id;
  const leafletObject = leafletObjectMap.get(rowId);
  leafletObjectMap.delete(rowId);
  return [leafletObject, rowId];
}

const { addToDebugObject, deleteFromDebugObject, saveDebugObject } = createGeometryDebugObject();

// TODO make a better name for it
export default function HyperleafletGeometryManager(map, geometryStrategy) {
  const addNoteListToHyperleaflet = (nodes) => {
    nodes.forEach((node) => {
      if (node.nodeType === 1 && node.matches('[data-id]')) {
        const [leafletObject, rowId, geometry, geometryType] = addNodeToHyperleaflet(node);
        leafletObject.addTo(map);
        if (rowId) {
          if (['none', 'object'].includes(geometryStrategy)) {
            node.removeAttribute('data-geometry');
            if (geometryStrategy === 'object') {
              addToDebugObject(rowId, geometry, geometryType);
            }
          }
        }
      }
    });
    saveDebugObject();
  };

  const removeNodeListToHyperleaflet = (nodes) => {
    nodes.forEach((node) => {
      if (node.nodeType === 1 && node.matches('[data-id]')) {
        const [leafletObject, rowId] = deleteNodeFromHyperleaflet(node);
        leafletObject.remove();
        if (['none', 'object'].includes(geometryStrategy)) {
          deleteFromDebugObject(rowId);
        }
      }
    });
    saveDebugObject();
  };

  return { addNoteListToHyperleaflet, removeNodeListToHyperleaflet };
}
