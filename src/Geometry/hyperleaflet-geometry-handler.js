import createLeafletObject from './leaflet-geometry';

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

export default function hyperleafletGeometryHandler(map, { addCallback = () => {}, removeCallback = () => {} }) {
  const addNoteListToHyperleaflet = (nodes) => {
    nodes.forEach((node) => {
      addNodeToHyperleaflet(node, map);
      addCallback(node);
    });
  };

  function removeNodeListToHyperleaflet(nodes) {
    nodes.forEach((node) => {
      deleteNodeFromHyperleaflet(node, map);
      removeCallback(node);
    });
  }

  return { addNoteListToHyperleaflet, removeNodeListToHyperleaflet };
}

export function diffNodesWithMap(mutations, map) {
  // eslint-disable-next-line no-underscore-dangle
  const leafletLayers = Object.values(map._layers);
  const addList = [];
  const removeList = [];

  function getAddedNodes(nodes) {
    nodes.forEach((node) => {
      if (node.nodeType === 1 && node.matches('[data-id]')) {
        addList.push(node);
      }
      if (node.childNodes.length > 0) {
        getAddedNodes(node.childNodes);
      }
    });
  }

  function getRemovedNodes(nodes) {
    nodes.forEach((node) => {
      if (node.nodeType === 1 && node.matches('[data-id]')) {
        removeList.push(node);
      }
      if (node.childNodes.length > 0) {
        getRemovedNodes(node.childNodes);
      }
    });
  }

  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      getAddedNodes(mutation.addedNodes);
      getRemovedNodes(mutation.removedNodes);
    }
  });

  const filteredRemoveList =
    removeList.filter((node) => !addList.some((addNode) => addNode.dataset.id === node.dataset.id)) ?? [];

  const filteredAddList =
    addList.filter((node) => !leafletLayers.some((leafletNode) => leafletNode.hlID === node.dataset.id)) ?? [];

  return { addedNodes: filteredAddList, removedNodes: filteredRemoveList };
}
