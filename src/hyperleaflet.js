/**
 * Hyperleaflet — main module.
 *
 * Merges: Map creation, tile layers, layer groups, map events,
 * geometry handler, config, and HyperChange wiring.
 *
 * No extension hooks. No custom EventTarget polyfill.
 * No deep-merge utility. No separate config module.
 */

import * as L from 'leaflet';
import { HyperChange } from './hyperchange';
import { createGeometry, updateGeometry, addGeometryType } from './geometry';

// --- Default options ---

const DEFAULT_OPTIONS = {
  reverseCoordinateOrder: false,
  mapElement: '#map',
  events: {
    target: 'window',
    map: {
      click: true,
      dblclick: false,
      mousedown: false,
      mouseover: false,
      mousemove: false,
      mouseout: false,
      contextmenu: false,
      preclick: false,
      zoom: true,
      move: true,
      zoomstart: false,
      zoomend: false,
      movestart: false,
      moveend: false,
      ready: true,
    },
    geometry: {
      click: true,
      move: false,
      add: false,
    },
    hyperleaflet: {
      ready: true,
    },
  },
  styles: {},
};

function mergeDeep(target, source) {
  const out = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      out[key] = mergeDeep(target[key], source[key]);
    } else {
      out[key] = source[key];
    }
  }
  return out;
}

// --- Config (inline, no separate module) ---

const config = {
  _hyperleaflet: null,
  _options: { ...DEFAULT_OPTIONS, events: JSON.parse(JSON.stringify(DEFAULT_OPTIONS.events)) },

  get options() {
    return this._options;
  },

  set options(opts) {
    this._options = mergeDeep(this._options, opts);
  },

  reset() {
    this._options = { ...DEFAULT_OPTIONS, events: JSON.parse(JSON.stringify(DEFAULT_OPTIONS.events)) };
  },

  getTarget() {
    const { target } = this._options.events;
    switch (target) {
      case 'window':
        return window;
      case 'document':
        return document;
      case 'hyperleaflet':
      default:
        return this._hyperleaflet;
    }
  },
};

// --- Built-in tile layers ---

const BUILT_IN_TILES = {
  OpenStreetMap: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }),
  EsriWorldImagery: L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution:
        'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    },
  ),
};

function registerTileLayer(name, { url, minZoom = 0, maxZoom = 18, tms } = {}) {
  if (BUILT_IN_TILES[name]) return;
  BUILT_IN_TILES[name] = new L.TileLayer(url, { minZoom, maxZoom, tms: !!tms });
}

function parseTileElements(tileNodeList) {
  const tileList = Array.from(tileNodeList);
  const tiles = [];

  for (const el of tileList) {
    const name = el.dataset.tile;
    if (!(name in BUILT_IN_TILES)) {
      const { tileUrl, tms, minZoom, maxZoom } = el.dataset;
      registerTileLayer(name, { url: tileUrl, tms, minZoom, maxZoom });
    }
    tiles.push({ name, tile: BUILT_IN_TILES[name] });
  }

  // Find default tile
  const defaultEl = tileList.find((t) => 'defaultTile' in t.dataset);
  let defaultTile;
  if (defaultEl && defaultEl.dataset.tile in BUILT_IN_TILES) {
    defaultTile = BUILT_IN_TILES[defaultEl.dataset.tile];
  } else if (tileList.length && tileList[0].dataset.tile in BUILT_IN_TILES) {
    defaultTile = BUILT_IN_TILES[tileList[0].dataset.tile];
  } else {
    defaultTile = BUILT_IN_TILES.OpenStreetMap;
  }

  return { defaultTile, tiles };
}

// --- Layer groups ---

const layerGroups = {};

function getLayerGroup(name) {
  return layerGroups[name];
}

function createLayerGroup(name, layerControl) {
  const group = L.layerGroup();
  layerGroups[name] = group;
  layerControl.addOverlay(group, name);
  return group;
}

function deleteLayerGroupIfEmpty(name, layerControl) {
  if (!name || !layerGroups[name]) return;
  if (layerGroups[name].getLayers().length) return;
  const group = layerGroups[name];
  delete layerGroups[name];
  layerControl.removeLayer(group);
}

// --- Map creation ---

function safeParsePoint(raw, reverse) {
  try {
    const point = JSON.parse(raw);
    return reverse ? point.reverse() : point;
  } catch {
    return [0, 0];
  }
}

function createMap(container) {
  const { mapConfig } = container.dataset;
  const target = mapConfig ? document.querySelector(mapConfig) : container;
  if (!target) throw new Error('hyperleaflet: no map config found');

  const { center, zoom, minZoom, maxZoom } = target.dataset;
  const reverse = config.options.reverseCoordinateOrder;

  const leafletMap = L.map(container, {
    center: safeParsePoint(center, reverse),
    zoom: zoom || 1,
    minZoom: minZoom || 0,
    maxZoom: maxZoom || 18,
  });

  return [leafletMap, target];
}

// --- Map events ---

const STATE_EVENTS = ['zoomstart', 'zoomend', 'movestart', 'moveend', 'zoom', 'move'];
const MOUSE_EVENTS = ['click', 'dblclick', 'mousedown', 'mouseover', 'mouseout', 'mousemove', 'contextmenu', 'preclick'];

function createStateEvent(map, name, leafletEvent) {
  const bounds = map.getBounds();
  return new CustomEvent(name, {
    detail: {
      zoom: map.getZoom(),
      center: map.getCenter(),
      bbox: { min: bounds.getSouthWest(), max: bounds.getNorthEast() },
      bboxString: bounds.toBBoxString(),
      _leafletEvent: leafletEvent,
    },
  });
}

function bindMapEvents(map, eventTarget) {
  const mapEvents = config.options.events.map;

  for (const [name, enabled] of Object.entries(mapEvents)) {
    if (!enabled) continue;

    if (STATE_EVENTS.includes(name)) {
      map.on(name, (e) => eventTarget.dispatchEvent(createStateEvent(map, `map:${name}`, e)));
    }
    if (MOUSE_EVENTS.includes(name)) {
      map.on(name, (e) => {
        eventTarget.dispatchEvent(
          new CustomEvent(`map:${name}`, { detail: { point: e.latlng, _leafletEvent: e } }),
        );
      });
    }
  }

  if (mapEvents.ready) {
    map.whenReady(() => eventTarget.dispatchEvent(createStateEvent(map, 'map:ready')));
  }
}

function sendHyperleafletReady(map, eventTarget) {
  if (!config.options.events.hyperleaflet.ready) return;
  const bounds = map.getBounds();
  eventTarget.dispatchEvent(
    new CustomEvent('hyperleaflet:ready', {
      detail: {
        zoom: map.getZoom(),
        center: map.getCenter(),
        bbox: { min: bounds.getSouthWest(), max: bounds.getNorthEast() },
        bboxString: bounds.toBBoxString(),
      },
    }),
  );
}

// --- Geometry handler (fixed: uses HyperChange API correctly) ---

// O(1) lookup by data-id instead of O(n) layer scan
const geometryIndex = new Map();

function addNode(node, map, layerControl) {
  const { dataset } = node;
  const { layerName, id } = dataset;

  let target = map;
  if (layerName) {
    const existing = getLayerGroup(layerName);
    if (existing) {
      target = existing;
    } else {
      target = createLayerGroup(layerName, layerControl);
      target.addTo(map);
    }
  }

  const opts = {
    reverseCoordinateOrder: config.options.reverseCoordinateOrder,
    styles: config.options.styles,
    eventTarget: config.getTarget(),
    geometryClickEnabled: config.options.events.geometry.click,
  };

  const leafletObj = createGeometry(dataset, opts);
  leafletObj.hlID = id;
  leafletObj.addTo(target);
  geometryIndex.set(id, { layer: leafletObj, target });
}

function removeNode(node, layerControl) {
  const id = node.dataset.id;
  const entry = geometryIndex.get(id);
  if (!entry) return;

  entry.target.removeLayer(entry.layer);
  geometryIndex.delete(id);

  const layerName = node.dataset.layerName;
  deleteLayerGroupIfEmpty(layerName, layerControl);
}

/**
 * Handle attribute change from HyperChange.
 * HyperChange emits: { node, key, attribute, from, to }
 * Old code incorrectly accessed change['data-id'] and change.dataset — FIXED.
 */
function changeNode(change) {
  const id = change.key;
  const entry = geometryIndex.get(id);
  if (!entry) return;

  if (change.attribute === 'data-geometry') {
    const opts = {
      reverseCoordinateOrder: config.options.reverseCoordinateOrder,
    };
    updateGeometry(entry.layer, change.node.dataset, opts);
  }
  // Other attribute changes could be handled here in the future
}

// --- Hyperleaflet object ---

const HYPERLEAFLET_DATA_SOURCE = '[data-hyperleaflet-source]';

export const Hyperleaflet = {
  map: null,
  target: null,
  _hyperchange: null,
  _layerControl: null,

  initialize(mapContainer) {
    if (!mapContainer) {
      console.warn('hyperleaflet: no map container found.');
      return;
    }
    mapContainer.setAttribute('hyperleaflet', '');

    const eventTarget = config.getTarget();
    const [map, target] = createMap(mapContainer);
    this.map = map;
    this.target = target;

    // Tile layers + layer control
    this._layerControl = L.control.layers();
    this._layerControl.addTo(map);

    const tileElements = mapContainer.querySelectorAll('[data-tile]');
    const { defaultTile, tiles } = parseTileElements(tileElements);

    for (const { name, tile } of tiles) {
      this._layerControl.addBaseLayer(tile, name);
    }
    defaultTile.addTo(map);

    // Map events
    bindMapEvents(map, eventTarget);

    // Wire up data source
    this._initDataSource(eventTarget);

    // Ready event
    sendHyperleafletReady(map, eventTarget);
  },

  _initDataSource(eventTarget) {
    const source = document.querySelector(HYPERLEAFLET_DATA_SOURCE);
    if (!source) return;

    const layerControl = this._layerControl;
    const map = this.map;

    this._hyperchange = new HyperChange(source, {
      key: 'data-id',
      watch: ['data-geometry'],
    });

    this._hyperchange.on('add', (entries) => {
      for (const entry of entries) {
        addNode(entry.node, map, layerControl);
      }
    });

    this._hyperchange.on('remove', (entries) => {
      for (const entry of entries) {
        removeNode(entry.node, layerControl);
      }
    });

    this._hyperchange.on('change', (entries) => {
      for (const entry of entries) {
        changeNode(entry);
      }
    });

    // Process initial elements already in the DOM
    map.whenReady(() => {
      this._hyperchange.scan();
    });
  },

  // --- Public API ---

  getZoom() {
    return this.map.getZoom();
  },
  setZoom(zoom) {
    this.map.setZoom(zoom);
  },
  getCenter() {
    return this.map.getCenter();
  },
  getBounds() {
    return this.map.getBounds();
  },
  getBBoxString() {
    return this.map.getBounds().toBBoxString();
  },
  panTo(center) {
    this.map.panTo(center);
  },
  flyTo(center, zoom) {
    this.map.flyTo(center, zoom || this.map.getZoom());
  },
  flyToBounds(bounds) {
    this.map.flyToBounds(bounds);
  },
  fitBounds(bounds) {
    this.map.fitBounds(bounds);
  },

  getLayer(id) {
    const entry = geometryIndex.get(id);
    return entry ? entry.layer : null;
  },

  openPopup(id) {
    const entry = geometryIndex.get(id);
    if (entry && entry.layer.openPopup) entry.layer.openPopup();
  },

  closePopup(id) {
    const entry = geometryIndex.get(id);
    if (entry && entry.layer.closePopup) entry.layer.closePopup();
  },

  addGeometryType(type, handlers) {
    addGeometryType(type, handlers);
  },
};

// Expose config on Hyperleaflet
Hyperleaflet.config = config;
config._hyperleaflet = Hyperleaflet;

// Make Hyperleaflet act as an EventTarget for addEventListener/removeEventListener/dispatchEvent
const _eventListeners = {};

Hyperleaflet.addEventListener = function (type, listener) {
  if (!(type in _eventListeners)) _eventListeners[type] = [];
  _eventListeners[type].push(listener);
};

Hyperleaflet.removeEventListener = function (type, listener) {
  if (!(type in _eventListeners)) return;
  const idx = _eventListeners[type].indexOf(listener);
  if (idx !== -1) _eventListeners[type].splice(idx, 1);
};

Hyperleaflet.dispatchEvent = function (event) {
  if (!(event.type in _eventListeners)) return true;
  for (const listener of _eventListeners[event.type].slice()) {
    listener.call(Hyperleaflet, event);
  }
  return !event.defaultPrevented;
};
