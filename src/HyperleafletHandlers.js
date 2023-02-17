import createLeafletObject from './Geometry';
import createGeometryDebugObject from './GeometryDebug';

export default function Hyperleaflet(map) {
  const leafletObjects = {};

  const proxy = new Proxy(leafletObjects, {
    set(target, id, row) {
      if (id in target) {
        // eslint-disable-next-line no-console
        console.error(`${id} already exists`);
        return false;
      }

      const leafletObject = createLeafletObject(row);

      if (leafletObject) {
        leafletObject.addTo(map);
        target[id] = leafletObject;
      } else {
        // eslint-disable-next-line no-console
        console.warn(`Geometry with ${id} can not be created`);
      }
      return true;
    },
    deleteProperty(target, id) {
      target[id].remove();
      delete target[id];
      return true;
    },
  });

  function addNodeToHyperleaflet(node) {
    const { dataset: data } = node;
    const rowId = data.id;
    proxy[rowId] = { ...data };
    return [rowId, data.geometry, data.geometryType];
  }
  function deleteNodeFromHyperleaflet(node) {
    const rowId = node.dataset.id;
    delete proxy[rowId];
    return rowId;
  }

  const { addToDebugObject, deleteFromDebugObject, saveDebugObject } = createGeometryDebugObject();

  const makeAddNoteListToHyperleaflet = (geometryStrategy) => (nodes) =>  {
    nodes.forEach((node) => {
      if (node.nodeType === 1 && node.matches('[data-id]')) {
        const [rowId, geometry, geometryType] = addNodeToHyperleaflet(node);
        if (rowId) {
          if (["none", "object"].includes(geometryStrategy)) {
            node.removeAttribute("data-geometry")
            if(geometryStrategy === "object" ) {
              addToDebugObject(rowId, geometry, geometryType);
            }
          }
        }
      }
    });
    saveDebugObject()
  }

  const makeRemoveNodeListToHyperleaflet = (geometryStrategy) => (nodes) => {
    nodes.forEach((node) => {
      if (node.nodeType === 1 && node.matches('[data-id]')) {
        const rowId = deleteNodeFromHyperleaflet(node);
        if (["none", "object"].includes(geometryStrategy)) {
          deleteFromDebugObject(rowId);
        }
      }
    });
    saveDebugObject()
  }

  function hyperleafletInteraction(geometryStrategy) {
    const addNoteListToHyperleaflet = makeAddNoteListToHyperleaflet(geometryStrategy);
    const removeNodeListToHyperleaflet = makeRemoveNodeListToHyperleaflet(geometryStrategy);
    return {addNoteListToHyperleaflet, removeNodeListToHyperleaflet}
  }

  return { hyperleafletInteraction };
}
