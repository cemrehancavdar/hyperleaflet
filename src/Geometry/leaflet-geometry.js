import { marker, polyline, polygon, GeoJSON } from 'leaflet';
import {setPointEvents, setPolyGeometryEvents} from './events';

const createPointGeometry = (parsedGeometry, options) => {
  const flippedGeometry = [...parsedGeometry].reverse()
  const geometry = marker(flippedGeometry);
  if (options.popup) {
    geometry.bindPopup(options.popup);
  }
  if (options.tooltip) {
    geometry.bindTooltip(options.tooltip);
  }
  setPointEvents(geometry, options.id);
  return geometry;
};

const createLineGeometry = (parsedGeometry, options) => {
  const flippedGeometry = GeoJSON.coordsToLatLngs(parsedGeometry, 0);
  const geometry = polyline(flippedGeometry);
  if (options.popup) {
    geometry.bindPopup(options.popup);
  }
  if (options.tooltip) {
    geometry.bindTooltip(options.tooltip);
  }
  setPolyGeometryEvents(geometry, options.id);
  return geometry;
};

const createPolygonGeometry = (parsedGeometry, options) => {
  const flippedGeometry = GeoJSON.coordsToLatLngs(parsedGeometry, 1);
  const geometry = polygon(flippedGeometry);
  if (options.popup) {
    geometry.bindPopup(options.popup);
  }
  if (options.tooltip) {
    geometry.bindTooltip(options.tooltip);
  }
  setPolyGeometryEvents(geometry, options.id);
  return geometry;
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
