import L from 'leaflet';
import { setGeometryEvents } from './events';

const createPointGeometry = (parsedGeometry, options) => {
  const marker = L.marker(parsedGeometry);
  if (options.popup) {
    marker.bindPopup(options.popup);
  }
  if (options.tooltip) {
    marker.bindTooltip(options.tooltip);
  }
  setGeometryEvents(marker, options.id);
  return marker;
};

const createLineGeometry = (parsedGeometry, options) => {
  const flippedGeometry = L.GeoJSON.coordsToLatLngs(parsedGeometry, 1);
  const line = L.polyline(flippedGeometry);
  if (options.popup) {
    line.bindPopup(options.popup);
  }
  if (options.tooltip) {
    line.bindTooltip(options.tooltip);
  }
  setGeometryEvents(line, options.id);
  return line;
};

const createPolygonGeometry = (parsedGeometry, options) => {
  const flippedGeometry = L.GeoJSON.coordsToLatLngs(parsedGeometry, 1);
  const polygon = L.polygon(flippedGeometry);
  if (options.popup) {
    polygon.bindPopup(options.popup);
  }
  if (options.tooltip) {
    polygon.bindTooltip(options.tooltip);
  }
  setGeometryEvents(polygon, options.id);
  return polygon;
};

const createGeometry = (geometryType) => (parsedGeometry, options) => {
  switch (geometryType) {
    case 'Point':
      return createPointGeometry(parsedGeometry, options);
    case 'LineString':
      return createLineGeometry(parsedGeometry, options);
    case 'Polygon':
      return createPolygonGeometry(parsedGeometry, options);
    default:
      // eslint-disable-next-line no-console
      console.warn(`${geometryType} is not supported`);
      return null;
  }
};

export default function createLeafletObject(row) {
  const { geometry, popup, tooltip, geometryType, id } = row;
  const parsedGeometry = JSON.parse(geometry);

  const createGeometryFn = createGeometry(geometryType);
  return createGeometryFn(parsedGeometry, { popup, tooltip, id });
}
