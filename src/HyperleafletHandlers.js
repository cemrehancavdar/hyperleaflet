import createLeafletObject from './Geometry';

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

  return [leafletObject];
}

function deleteNodeFromHyperleaflet(node) {
  const rowId = node.dataset.id;
  const leafletObject = leafletObjectMap.get(rowId);
  leafletObjectMap.delete(rowId);
  return [leafletObject];
}

// TODO make a better name for it
export default function HyperleafletGeometryManager(map) {
  const addNoteListToHyperleaflet = (nodes) => {
    nodes.forEach((node) => {
      if (node.nodeType === 1 && node.matches('[data-id]')) {
        const [leafletObject] = addNodeToHyperleaflet(node);
        leafletObject.addTo(map);
      }
    });
  };

  function removeNodeListToHyperleaflet(nodes) {
    nodes.forEach((node) => {
      if (node.nodeType === 1 && node.matches('[data-id]')) {
        const [leafletObject] = deleteNodeFromHyperleaflet(node);
        leafletObject.remove();
      }
    });
  };

  return { addNoteListToHyperleaflet, removeNodeListToHyperleaflet };
}
