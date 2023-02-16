import createLeafletObject from './geometry';

export default function LeafletWrapper(map) {
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

  function addNodeToHyperleaf(node) {
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
  return { addNodeToHyperleaf, deleteNodeFromHyperleaflet };
}
