import createLeafletObject from './Geometry';
import createGeometryDebugObject from './GeometryDebug';

const leafletObjectMap = new Map();

function addNodeToHyperleaflet(node, map) {
  const { dataset: data } = node;
  const rowId = data.id;

  if (rowId in leafletObjectMap) {
    // eslint-disable-next-line no-console
    console.error(`%c${rowId}`, 'color:red', 'already exists', node);
    return [];
  }

  const leafletObject = createLeafletObject({ ...data });
  leafletObjectMap.set(rowId, leafletObject);
  leafletObject.addTo(map);

  return [rowId, data.geometry, data.geometryType];
}

function deleteNodeFromHyperleaflet(node) {
  const rowId = node.dataset.id;
  leafletObjectMap.get(rowId).remove();
  leafletObjectMap.delete(rowId);
  return rowId;
}

const { addToDebugObject, deleteFromDebugObject, saveDebugObject } = createGeometryDebugObject();

export default function Hyperleaflet(map) {
  const makeAddNoteListToHyperleaflet = (geometryStrategy) => (nodes) => {
    nodes.forEach((node) => {
      if (node.nodeType === 1 && node.matches('[data-id]')) {
        const [rowId, geometry, geometryType] = addNodeToHyperleaflet(node, map);
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

  const makeRemoveNodeListToHyperleaflet = (geometryStrategy) => (nodes) => {
    nodes.forEach((node) => {
      if (node.nodeType === 1 && node.matches('[data-id]')) {
        const rowId = deleteNodeFromHyperleaflet(node, map);
        if (['none', 'object'].includes(geometryStrategy)) {
          deleteFromDebugObject(rowId);
        }
      }
    });
    saveDebugObject();
  };

  function hyperleafletInteraction(geometryStrategy) {
    const addNoteListToHyperleaflet = makeAddNoteListToHyperleaflet(geometryStrategy);
    const removeNodeListToHyperleaflet = makeRemoveNodeListToHyperleaflet(geometryStrategy);
    return { addNoteListToHyperleaflet, removeNodeListToHyperleaflet };
  }

  return { hyperleafletInteraction };
}
