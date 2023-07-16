import { GeoJSON, marker, polygon, polyline } from 'leaflet';
import { setPointEvents, setPolyGeometryEvents } from './events';
import hyperleafletConfig from '../config';

const createPointGeometry = (parsedGeometry, options) => {
  const { reverseOrderAll, reverseOrder } = options;
  const isLonLat = reverseOrderAll || reverseOrder !== undefined;
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

function changePointGeometry(leafletObject, parsedGeometry, options) {
  const { reverseOrderAll, reverseOrder } = options;
  const isLonLat = reverseOrderAll || reverseOrder !== undefined;
  const geometry = isLonLat ? [...parsedGeometry].reverse() : parsedGeometry;
  leafletObject.setLatLng(geometry);
  return leafletObject;
}

const createLineGeometry = (parsedGeometry, options) => {
  const { reverseOrderAll, reverseOrder } = options;
  const isLonLat = reverseOrderAll || reverseOrder !== undefined;
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

function changeLineGeometry(leafletObject, parsedGeometry, options) {
  const { reverseOrderAll, reverseOrder } = options;
  const isLonLat = reverseOrderAll || reverseOrder !== undefined;
  const geometry = isLonLat ? GeoJSON.coordsToLatLngs(parsedGeometry, 0) : parsedGeometry;
  leafletObject.setLatLngs(geometry);
  return leafletObject;
}

const createPolygonGeometry = (parsedGeometry, options) => {
  const { reverseOrderAll, reverseOrder } = options;
  const isLonLat = reverseOrderAll || reverseOrder !== undefined;
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

function changePolygonGeometry(leafletObject, parsedGeometry, options) {
  const { reverseOrderAll, reverseOrder } = options;
  const isLonLat = reverseOrderAll || reverseOrder !== undefined;
  const geometry = isLonLat ? GeoJSON.coordsToLatLngs(parsedGeometry, 1) : parsedGeometry;
  leafletObject.setLatLngs(geometry);
  return leafletObject;
}

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

function changeGeometry(leafletObject, change) {
  const { geometryType } = change.dataset;
  const parsedGeometry = JSON.parse(change.to);
  const { reverseOrderAll } = hyperleafletConfig;

  switch (geometryType) {
    case 'Point':
      return changePointGeometry(leafletObject, parsedGeometry, { ...change.dataset, reverseOrderAll });
    case 'LineString':
      return changeLineGeometry(leafletObject, parsedGeometry, { ...change.dataset, reverseOrderAll });
    case 'Polygon':
      return changePolygonGeometry(leafletObject, parsedGeometry, { ...change.dataset, reverseOrderAll });
    default:
      // eslint-disable-next-line no-console
      console.warn(`${geometryType} is not supported`);
      return null;
  }
}

export function createLeafletObject(dataset) {
  const { geometry, popup, tooltip, geometryType, id, reverseOrder } = dataset;
  const parsedGeometry = JSON.parse(geometry);
  const { reverseOrderAll } = hyperleafletConfig;
  const createGeometryFn = createGeometry(geometryType);
  return createGeometryFn(parsedGeometry, { popup, tooltip, id, reverseOrderAll, reverseOrder });
}

export function changeLeafletObject(leafletObject, change) {
  switch (change.attribute) {
    case 'data-geometry': {
      return changeGeometry(leafletObject, change);
    }
    default: {
      throw new Error('Parameter is not a number!');
    }
  }
}
