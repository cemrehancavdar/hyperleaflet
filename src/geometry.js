/**
 * Geometry — create, update, remove Leaflet objects from data attributes.
 *
 * Merged from old Geometry/geometry.js + Geometry/events.js.
 * No global Config dependency — receives options/eventTarget from hyperleaflet.js.
 */

import * as L from 'leaflet';

// --- Coordinate parsing ---

function parseGeometry(raw) {
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      console.warn('hyperleaflet: failed to parse geometry string:', raw);
      return null;
    }
  }
  return null;
}

// --- Geometry type registry ---

const GEOMETRY_TYPES = {
  point: {
    create: (coords, style) => L.marker(coords, style),
    update: (obj, coords) => obj.setLatLng(coords),
    convert: (coords, lonLat) => (lonLat ? [...coords].reverse() : coords),
    eventShape: 'mono',
  },
  linestring: {
    create: (coords, style) => L.polyline(coords, style),
    update: (obj, coords) => obj.setLatLngs(coords),
    convert: (coords, lonLat) => (lonLat ? L.GeoJSON.coordsToLatLngs(coords, 0) : coords),
    eventShape: 'poly',
  },
  polygon: {
    create: (coords, style) => L.polygon(coords, style),
    update: (obj, coords) => obj.setLatLngs(coords),
    convert: (coords, lonLat) => (lonLat ? L.GeoJSON.coordsToLatLngs(coords, 1) : coords),
    eventShape: 'poly',
  },
  circlemarker: {
    create: (coords, style) => L.circleMarker(coords, style),
    update: (obj, coords) => obj.setLatLng(coords),
    convert: (coords, lonLat) => (lonLat ? [...coords].reverse() : coords),
    eventShape: 'mono',
  },
};

/**
 * Register a custom geometry type.
 * @param {string} type — lowercase type name
 * @param {{ create, update, convert }} handlers
 */
export function addGeometryType(type, handlers) {
  if (!handlers.create || !handlers.update || !handlers.convert) {
    throw new Error('Invalid handlers provided.');
  }
  GEOMETRY_TYPES[type] = handlers;
}

// --- Inline style extraction from data-* attributes ---

// Leaflet Path options that can be set via data attributes.
// data-color="red" → { color: 'red' }, data-weight="3" → { weight: 3 }
const NUMERIC_STYLE_KEYS = new Set(['weight', 'opacity', 'fillOpacity', 'radius', 'dashOffset']);
const STRING_STYLE_KEYS = new Set(['color', 'fillColor', 'dashArray', 'lineCap', 'lineJoin', 'className']);
const BOOLEAN_STYLE_KEYS = new Set(['fill', 'stroke']);

/**
 * Extract Leaflet Path style options from a dataset.
 * Returns undefined if no style attributes are found (avoids empty object allocation).
 */
function extractInlineStyle(dataset) {
  let style;

  for (const key of NUMERIC_STYLE_KEYS) {
    if (dataset[key] !== undefined) {
      style = style || {};
      style[key] = parseFloat(dataset[key]);
    }
  }
  for (const key of STRING_STYLE_KEYS) {
    if (dataset[key] !== undefined) {
      style = style || {};
      style[key] = dataset[key];
    }
  }
  for (const key of BOOLEAN_STYLE_KEYS) {
    if (dataset[key] !== undefined) {
      style = style || {};
      style[key] = dataset[key] !== 'false';
    }
  }

  return style;
}

// --- Internal helpers ---

function shouldReverse(globalReverse, elementReverse) {
  return globalReverse || elementReverse !== undefined;
}

function bindPopupAndTooltip(leafletObj, popup, tooltip) {
  if (popup) leafletObj.bindPopup(popup);
  if (tooltip) leafletObj.bindTooltip(tooltip);
}

function attachClickEvent(leafletObj, id, shape, eventTarget, eventsEnabled) {
  if (!eventsEnabled) return;

  if (shape === 'mono') {
    leafletObj.on('click', (e) => {
      eventTarget.dispatchEvent(
        new CustomEvent('geometry:click', {
          detail: { clickedPoint: e.latlng, geometry: leafletObj.getLatLng(), id },
        }),
      );
    });
  } else if (shape === 'poly') {
    leafletObj.on('click', (e) => {
      eventTarget.dispatchEvent(
        new CustomEvent('geometry:click', {
          detail: { clickedPoint: e.latlng, geometry: leafletObj.getLatLngs(), id },
        }),
      );
    });
  }
}

// --- Public API ---

/**
 * Create a Leaflet geometry object from a DOM element's dataset.
 *
 * @param {DOMStringMap} dataset — the element's dataset
 * @param {object} opts
 * @param {boolean} opts.reverseCoordinateOrder — global lon/lat flag
 * @param {object} opts.styles — style lookup { geometryType: { styleName: styleObj } }
 * @param {EventTarget} opts.eventTarget — where to dispatch geometry:click
 * @param {boolean} opts.geometryClickEnabled — whether geometry:click is on
 * @returns {L.Layer}
 */
export function createGeometry(dataset, opts) {
  const { geometry: rawGeometry, geometryType, style, popup, tooltip, id, reverseOrder } = dataset;
  const coords = parseGeometry(rawGeometry);
  const typeLower = geometryType.toLowerCase();
  const typeInfo = GEOMETRY_TYPES[typeLower];

  if (!typeInfo) {
    throw new Error(`Invalid geometry type: ${geometryType}`);
  }

  const lonLat = shouldReverse(opts.reverseCoordinateOrder, reverseOrder);
  const converted = typeInfo.convert(coords, lonLat);

  // Style resolution: config preset as base, inline data-* attributes override
  const presetStyle = opts.styles?.[typeLower]?.[style];
  const inlineStyle = extractInlineStyle(dataset);
  const mergedStyle = presetStyle || inlineStyle
    ? { ...presetStyle, ...inlineStyle }
    : undefined;

  const leafletObj = typeInfo.create(converted, mergedStyle);
  bindPopupAndTooltip(leafletObj, popup, tooltip);
  attachClickEvent(leafletObj, id, typeInfo.eventShape, opts.eventTarget, opts.geometryClickEnabled);

  return leafletObj;
}

/**
 * Update an existing Leaflet geometry's position/shape.
 *
 * @param {L.Layer} leafletObj — existing Leaflet layer
 * @param {DOMStringMap} dataset — the element's updated dataset
 * @param {object} opts
 * @param {boolean} opts.reverseCoordinateOrder — global lon/lat flag
 */
export function updateGeometry(leafletObj, dataset, opts) {
  const { geometry: rawGeometry, geometryType, reverseOrder } = dataset;
  const coords = parseGeometry(rawGeometry);
  const typeLower = geometryType.toLowerCase();
  const typeInfo = GEOMETRY_TYPES[typeLower];

  if (!typeInfo) {
    throw new Error(`Invalid geometry type: ${geometryType}`);
  }

  const lonLat = shouldReverse(opts.reverseCoordinateOrder, reverseOrder);
  const converted = typeInfo.convert(coords, lonLat);
  return typeInfo.update(leafletObj, converted);
}
