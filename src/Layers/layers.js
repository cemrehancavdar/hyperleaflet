import * as L from 'leaflet';

function reverseCoordinates(point) {
  return point.reverse();
}

export function safeParsePoint(pointJson, reverse = false) {
  try {
    const point = JSON.parse(pointJson);
    return reverse ? reverseCoordinates(point) : point;
  } catch (_) {
    return [0, 0];
  }
}

export const Layers = {
  control: L.control.layers(),
  layerGroups: {},

  addBaseLayer(baseLayer, layerName) {
    this.control.addBaseLayer(baseLayer, layerName);
  },
  getLayerGroup(layerName) {
    return this.layerGroups?.[layerName];
  },
  createLayerGroup(layerName) {
    const layerGroup = L.layerGroup();
    this.layerGroups[layerName] = layerGroup;
    this.control.addOverlay(layerGroup, layerName);
    return layerGroup;
  },
  deleteLayerGroup(layerName, options = { ifEmpty: false }) {
    if (options.ifEmpty && this.layerGroups[layerName].getLayers().length) {
      return;
    }
    const layerGroup = this.layerGroups[layerName];
    delete this.layerGroups[layerName];
    this.control.removeLayer(layerGroup);
  },
};
