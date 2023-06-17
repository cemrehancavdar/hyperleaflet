import { marker, polyline, polygon, GeoJSON } from 'leaflet';
import { setPointEvents, setPolyGeometryEvents } from './events';
import hyperleafletConfig from '../config';

const createPointGeometry = (parsedGeometry, options) => {
  const { reverseOrderAll, reverseOrder } = options;
  const isLonLat = reverseOrderAll || (reverseOrder !== undefined)
  const geometry = isLonLat ? [...parsedGeometry].reverse() : parsedGeometry;
  const leafletGeometry = marker(geometry);
  if (options.popup) {
    leafletGeometry.bindPopup(options.popup);
  }
  if (options.tooltip) {
    leafletGeometry.bindTooltip(options.tooltip);
  }
  setPointEvents(leafletGeometry, options.id);
  return leafletGeometry;
};

const createLineGeometry = (parsedGeometry, options) => {
  const { reverseOrderAll, reverseOrder } = options;
  const isLonLat = reverseOrderAll || (reverseOrder !== undefined)
  const geometry = isLonLat ? GeoJSON.coordsToLatLngs(parsedGeometry, 0) : parsedGeometry;
  const leafletGeometry = polyline(geometry);
  if (options.popup) {
    leafletGeometry.bindPopup(options.popup);
  }
  if (options.tooltip) {
    leafletGeometry.bindTooltip(options.tooltip);
  }
  setPolyGeometryEvents(leafletGeometry, options.id);
  return leafletGeometry;
};

const createPolygonGeometry = (parsedGeometry, options) => {
  const { reverseOrderAll, reverseOrder } = options;
  const isLonLat = reverseOrderAll || (reverseOrder !== undefined)
  const geometry = isLonLat ? GeoJSON.coordsToLatLngs(parsedGeometry, 1) : parsedGeometry;
  const leafletGeometry = polygon(geometry);
  if (options.popup) {
    leafletGeometry.bindPopup(options.popup);
  }
  if (options.tooltip) {
    leafletGeometry.bindTooltip(options.tooltip);
  }
  setPolyGeometryEvents(leafletGeometry, options.id);
  return leafletGeometry;
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
  const { geometry, popup, tooltip, geometryType, id, reverseOrder } = row;
  const parsedGeometry = JSON.parse(geometry);
  const {reverseOrderAll} = hyperleafletConfig;
  const createGeometryFn = createGeometry(geometryType);
  return createGeometryFn(parsedGeometry, { popup, tooltip, id, reverseOrderAll, reverseOrder });
}
