import * as L from 'leaflet';
import { setMapEvents } from './events';
import { Config } from '../config';

function reverseCoordinates(point) {
  return point.reverse();
}

function safeParsePoint(pointJson, reverse = false) {
  try {
    const point = JSON.parse(pointJson);
    return reverse ? reverseCoordinates(point) : point;
  } catch (_) {
    return [0, 0];
  }
}

export const Map_ = {
  map: null,
  create(mapContainer) {
    const config = Config;
    const { mapConfig } = mapContainer.dataset;
    const target = mapConfig ? document.querySelector(mapConfig) : mapContainer;
    if (!target) throw new Error('No map config found');

    const { center, zoom, minZoom, maxZoom } = target.dataset;

    const { reverseCoordinateOrder } = config.options;
    const mapView = {
      center: safeParsePoint(center, reverseCoordinateOrder),
      zoom: zoom || 1,
    };
    const leafletMap = L.map(mapContainer, {
      center: mapView.center,
      zoom: mapView.zoom,
      minZoom: minZoom || 0,
      maxZoom: maxZoom || 18,
    });
    setMapEvents(leafletMap);
    return [leafletMap, target];
  },
};
