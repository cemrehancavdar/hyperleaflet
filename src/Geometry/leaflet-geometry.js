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
      return changePointGeometry(leafletObject, parsedGeometry, {
        ...change.dataset,
        reverseOrderAll,
      });
    case 'LineString':
      return changeLineGeometry(leafletObject, parsedGeometry, {
        ...change.dataset,
        reverseOrderAll,
      });
    case 'Polygon':
      return changePolygonGeometry(leafletObject, parsedGeometry, {
        ...change.dataset,
        reverseOrderAll,
      });
    default:
      // eslint-disable-next-line no-console
      console.warn(`${geometryType} is not supported`);
      return null;
  }
}

export function createLeafletObject(dataset) {
  // Image overlay
  if ('l' in dataset) {
    return createL(dataset);
  }

  // Geometry based L objects
  const { geometry, popup, tooltip, geometryType, id, reverseOrder } = dataset;
  const parsedGeometry = JSON.parse(geometry);
  const { reverseOrderAll } = hyperleafletConfig;
  const createGeometryFn = createGeometry(geometryType);
  return createGeometryFn(parsedGeometry, {
    popup,
    tooltip,
    id,
    reverseOrderAll,
    reverseOrder,
  });
}

/**
 * Create a L.* leaflet object from HTML data-* attributes
 */
function createL(dataset) {
  if (dataset.l.toLowerCase() === 'imageoverlay') {
    [
      ['imageUrl', 'data-image-url'],
      ['imageBounds', 'data-image-bounds'],
    ].forEach(([attr, htmlAttr]) => {
      if (typeof dataset[attr] === 'undefined') {
        throw new Error(`Required attribute ${htmlAttr} for image overlay not specified in dataset.`);
      }
    });
    return L.imageOverlay(dataset.imageUrl, JSON.parse(dataset.imageBounds));
  } else {
    throw new Error(`data-l ${dataset.l} not supported`);
  }
}

/**
 * Create a L.* leaflet object attributes
 */
function changeL(leafletObject, change) {
  switch (change.attribute.toLowerCase()) {
    case 'data-image-bounds':
      return leafletObject.setBounds(JSON.parse(change.to));
    case 'data-image-url':
      return leafletObject.setUrl(change.to);
    default:
      throw new Error(`change to ${change.attribute} not supported`);
  }
}

export function changeLeafletObject(leafletObject, change) {
  switch (change.attribute.toLowerCase()) {
    case 'data-geometry': {
      return changeGeometry(leafletObject, change);
    }
    case 'data-l':
    case 'data-image-url':
    case 'data-image-bounds':
      return changeL(leafletObject, change);
    default: {
      throw new Error('Parameter is not a number!');
    }
  }
}
