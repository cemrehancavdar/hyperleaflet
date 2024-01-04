import { sendEvent } from '../Geometry/events';
import { Geometry } from '../Geometry/geometry';

export function createGeometryHandler(map, layerModule) {
  function addNodeToHyperleaflet(node) {
    const {
      dataset,
      dataset: { layerName, id },
    } = node;

    let target = map;
    if (layerName) {
      const layer = layerModule.getLayerGroup(layerName);
      if (!layer) {
        target = layerModule.createLayerGroup(layerName);
        target.addTo(map);
      } else {
        target = layer;
      }
    }

    const leafletGeometry = Geometry.createGeometry(dataset);
    sendEvent('add', leafletGeometry, id, dataset.geometryType, target);
    leafletGeometry.hlID = id;
    leafletGeometry.addTo(target);
  }

  function deleteNodeFromHyperleaflet(node) {
    const rowId = node.dataset.id;
    const { layerName } = node.dataset;

    const layer = layerModule.getLayerGroup(layerName);

    const target = layer || map;

    const leafletLayers = Object.values(target._layers);
    const leafletObject = leafletLayers.find((_layer) => _layer.hlID === rowId);

    target.removeLayer(leafletObject);
    sendEvent('remove', leafletObject, rowId, node.dataset.geometryType, target);
    layerModule.deleteLayerGroup(layerName, { ifEmpty: true });
  }

  function changeNodeInHyperleaflet(change) {
    const rowId = change['data-id'];

    const leafletLayers = Object.values(map._layers);
    const leafletObject = leafletLayers.find((layer) => layer.hlID === rowId);

    switch (change.attribute) {
      case 'data-geometry': {
        sendEvent('change', leafletObject, rowId, change.dataset.geometryType, map);
        return Geometry.updateGeometry(leafletObject, change.dataset);
      }
      default: {
        throw new Error('Unsupported attribute change!');
      }
    }
  }

  return { addNodeToHyperleaflet, deleteNodeFromHyperleaflet, changeNodeInHyperleaflet };
}
