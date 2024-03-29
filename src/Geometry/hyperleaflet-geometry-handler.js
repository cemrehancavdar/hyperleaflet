import { createLeafletObject, changeLeafletObject } from './leaflet-geometry';

function addNodeToHyperleaflet(node, map) {
  const { dataset } = node;
  const rowId = dataset.id;
  // eslint-disable-next-line no-underscore-dangle
  const leafletLayers = Object.values(map._layers);

  if (leafletLayers.find((layer) => layer.hlID === rowId)) {
    // eslint-disable-next-line no-console
    console.error(`%c${rowId}`, 'color:red', 'already exists', node);
    return;
  }

  const leafletObject = createLeafletObject({ ...dataset });
  leafletObject.hlID = rowId;
  leafletObject.addTo(map);
}

function deleteNodeFromHyperleaflet(node, map) {
  const rowId = node.dataset.id;

  // eslint-disable-next-line no-underscore-dangle
  const leafletLayers = Object.values(map._layers);
  const leafletObject = leafletLayers.find((layer) => layer.hlID === rowId);
  leafletObject?.remove();
}

function changeNodeInHyperleaflet(change, map) {
  const rowId = change.changes['data-id'];
  // eslint-disable-next-line no-underscore-dangle
  const leafletLayers = Object.values(map._layers);
  const leafletObject = leafletLayers.find((layer) => layer.hlID === rowId);
  changeLeafletObject(leafletObject, change);
}

export default function hyperleafletGeometryHandler(map, { addCallback = () => {}, removeCallback = () => {} }) {
  const addNoteListToHyperleaflet = (nodes) => {
    nodes.forEach((node) => {
      addNodeToHyperleaflet(node, map);
      addCallback(node);
    });
  };

  function removeNodeListFromHyperleaflet(nodes) {
    nodes.forEach((node) => {
      deleteNodeFromHyperleaflet(node, map);
      removeCallback(node);
    });
  }

  function changeNodesInHyperleaflet(changes) {
    changes.forEach((change) => {
      changeNodeInHyperleaflet(change, map);
    });
  }

  return { addNoteListToHyperleaflet, removeNodeListFromHyperleaflet, changeNodesInHyperleaflet };
}
