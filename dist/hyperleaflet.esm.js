import * as L from 'leaflet';

function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _createForOfIteratorHelperLoose(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
  if (it) return (it = it.call(o)).next.bind(it);
  if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
    if (it) o = it;
    var i = 0;
    return function () {
      if (i >= o.length) return {
        done: true
      };
      return {
        done: false,
        value: o[i++]
      };
    };
  }
  throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

/**
 * HyperChange — MutationObserver diffing for hypermedia apps.
 *
 * Watches a DOM subtree and emits semantic add/remove/change events
 * by diffing nodes against a unique key attribute. Designed for use
 * with htmx, Turbo, LiveView, or any server-rendered HTML workflow
 * that swaps DOM content and needs to sync with imperative JS libraries.
 *
 * Internal module — not published as a separate package.
 */

var VALID_EVENTS = ['add', 'remove', 'change'];
var HyperChange = /*#__PURE__*/function () {
  /**
   * @param {HTMLElement} root — container element to observe
   * @param {object} options
   * @param {string} options.key — attribute name used as unique identifier (e.g. 'data-id')
   * @param {string[]} [options.watch=[]] — attributes to track for change detection
   * @param {boolean} [options.batch=false] — batch mutations per animation frame
   */
  function HyperChange(root, options) {
    var _this = this;
    if (!root || !(root instanceof HTMLElement)) {
      throw new Error('HyperChange: root must be an HTMLElement');
    }
    if (!options || !options.key) {
      throw new Error('HyperChange: options.key is required');
    }
    this._root = root;
    this._key = options.key;
    this._watch = options.watch || [];
    this._batch = options.batch || false;
    this._listeners = {
      add: [],
      remove: [],
      change: []
    };
    this._frameId = null;
    this._pendingMutations = [];
    this._disconnected = false;
    var hasWatch = this._watch.length > 0;
    this._observer = new MutationObserver(function (mutations) {
      if (_this._batch) {
        var _this$_pendingMutatio;
        (_this$_pendingMutatio = _this._pendingMutations).push.apply(_this$_pendingMutatio, mutations);
        if (_this._frameId === null) {
          _this._frameId = requestAnimationFrame(function () {
            _this._frameId = null;
            var batch = _this._pendingMutations.splice(0);
            _this._process(batch);
          });
        }
      } else {
        _this._process(mutations);
      }
    });
    this._observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: hasWatch,
      attributeFilter: hasWatch ? this._watch : undefined,
      attributeOldValue: hasWatch
    });
  }

  /**
   * Subscribe to an event.
   * @param {'add'|'remove'|'change'} event
   * @param {function} handler
   * @returns {function} unsubscribe function
   */
  var _proto = HyperChange.prototype;
  _proto.on = function on(event, handler) {
    var _this2 = this;
    if (this._disconnected) {
      throw new Error('HyperChange: cannot subscribe after disconnect');
    }
    if (!VALID_EVENTS.includes(event)) {
      throw new Error('HyperChange: invalid event "' + event + '". Must be one of: ' + VALID_EVENTS.join(', '));
    }
    this._listeners[event].push(handler);
    return function () {
      _this2._listeners[event] = _this2._listeners[event].filter(function (h) {
        return h !== handler;
      });
    };
  }

  /**
   * Remove a specific handler.
   * @param {'add'|'remove'|'change'} event
   * @param {function} handler
   */;
  _proto.off = function off(event, handler) {
    if (this._listeners[event]) {
      this._listeners[event] = this._listeners[event].filter(function (h) {
        return h !== handler;
      });
    }
  }

  /**
   * Fire 'add' events for all existing keyed children.
   * Useful for initial state — call after setting up handlers.
   */;
  _proto.scan = function scan() {
    var _this3 = this;
    var nodes = this._collectKeyedNodes(this._root);
    if (nodes.length > 0) {
      this._emit('add', nodes.map(function (node) {
        return {
          node: node,
          key: node.getAttribute(_this3._key)
        };
      }));
    }
  }

  /**
   * Stop observing. Clears all listeners. Instance is unusable after this.
   */;
  _proto.disconnect = function disconnect() {
    this._disconnected = true;
    this._observer.disconnect();
    if (this._frameId !== null) {
      cancelAnimationFrame(this._frameId);
      this._frameId = null;
    }
    this._pendingMutations = [];
    this._listeners = {
      add: [],
      remove: [],
      change: []
    };
  }

  // --- Private ---

  /**
   * Iteratively find all elements with the key attribute under a root.
   * Uses a stack instead of recursion to avoid stack overflow on deep trees.
   */;
  _proto._collectKeyedNodes = function _collectKeyedNodes(root) {
    var result = [];
    var stack = [];

    // Push root's children onto stack (reverse order so first child is processed first)
    for (var i = root.childNodes.length - 1; i >= 0; i--) {
      stack.push(root.childNodes[i]);
    }
    while (stack.length > 0) {
      var node = stack.pop();
      if (node.nodeType !== 1) continue;
      if (node.hasAttribute(this._key)) result.push(node);
      for (var _i = node.childNodes.length - 1; _i >= 0; _i--) {
        stack.push(node.childNodes[_i]);
      }
    }
    return result;
  }

  /**
   * Collect keyed nodes from a NodeList (used for MutationRecord addedNodes/removedNodes).
   */;
  _proto._collectKeyedFromNodeList = function _collectKeyedFromNodeList(nodeList) {
    var result = [];
    for (var _iterator = _createForOfIteratorHelperLoose(nodeList), _step; !(_step = _iterator()).done;) {
      var node = _step.value;
      if (node.nodeType !== 1) continue;
      if (node.hasAttribute(this._key)) result.push(node);
      // Also check descendants — a parent element may contain keyed children
      var stack = [];
      for (var i = node.childNodes.length - 1; i >= 0; i--) {
        stack.push(node.childNodes[i]);
      }
      while (stack.length > 0) {
        var child = stack.pop();
        if (child.nodeType !== 1) continue;
        if (child.hasAttribute(this._key)) result.push(child);
        for (var _i2 = child.childNodes.length - 1; _i2 >= 0; _i2--) {
          stack.push(child.childNodes[_i2]);
        }
      }
    }
    return result;
  }

  /**
   * Process a batch of MutationRecords into semantic add/remove/change events.
   */;
  _proto._process = function _process(mutations) {
    if (this._disconnected) return;
    var _this$_collectFromMut = this._collectFromMutations(mutations),
      removed = _this$_collectFromMut.removed,
      added = _this$_collectFromMut.added,
      attrChanges = _this$_collectFromMut.attrChanges;
    var _this$_diff = this._diff(removed, added),
      reallyAdded = _this$_diff.reallyAdded,
      reallyRemoved = _this$_diff.reallyRemoved,
      swapChanges = _this$_diff.swapChanges;
    var allChanges = attrChanges.length > 0 || swapChanges.length > 0 ? [].concat(attrChanges, swapChanges) : [];
    if (reallyAdded.length > 0) this._emit('add', reallyAdded);
    if (reallyRemoved.length > 0) this._emit('remove', reallyRemoved);
    if (allChanges.length > 0) this._emit('change', allChanges);
  }

  /**
   * Extract keyed nodes and attribute changes from raw MutationRecords.
   */;
  _proto._collectFromMutations = function _collectFromMutations(mutations) {
    var removed = [];
    var added = [];
    var attrChanges = [];
    for (var _iterator2 = _createForOfIteratorHelperLoose(mutations), _step2; !(_step2 = _iterator2()).done;) {
      var mutation = _step2.value;
      if (mutation.type === 'childList') {
        if (mutation.removedNodes.length > 0) {
          removed.push.apply(removed, this._collectKeyedFromNodeList(mutation.removedNodes));
        }
        if (mutation.addedNodes.length > 0) {
          added.push.apply(added, this._collectKeyedFromNodeList(mutation.addedNodes));
        }
      } else if (mutation.type === 'attributes') {
        var target = mutation.target;
        if (!target.hasAttribute(this._key)) continue;
        attrChanges.push({
          node: target,
          key: target.getAttribute(this._key),
          attribute: mutation.attributeName,
          from: mutation.oldValue,
          to: target.getAttribute(mutation.attributeName)
        });
      }
    }
    return {
      removed: removed,
      added: added,
      attrChanges: attrChanges
    };
  }

  /**
   * Diff added/removed nodes by key to distinguish real adds/removes
   * from innerHTML swap shuffles where the same key exists in both sets.
   */;
  _proto._diff = function _diff(removed, added) {
    var removedMap = new Map();
    for (var _iterator3 = _createForOfIteratorHelperLoose(removed), _step3; !(_step3 = _iterator3()).done;) {
      var node = _step3.value;
      var key = node.getAttribute(this._key);
      removedMap.set(key, node);
    }
    var addedMap = new Map();
    for (var _iterator4 = _createForOfIteratorHelperLoose(added), _step4; !(_step4 = _iterator4()).done;) {
      var _node = _step4.value;
      var _key = _node.getAttribute(this._key);
      addedMap.set(_key, _node);
    }

    // Keys present in both maps = same item swapped (innerHTML replace)
    var matchedKeys = new Set();
    var swapChanges = [];
    for (var _iterator5 = _createForOfIteratorHelperLoose(addedMap), _step5; !(_step5 = _iterator5()).done;) {
      var _step5$value = _step5.value,
        _key2 = _step5$value[0],
        newNode = _step5$value[1];
      var oldNode = removedMap.get(_key2);
      if (!oldNode) continue;
      matchedKeys.add(_key2);

      // Compare watched attributes between old and new node
      for (var _iterator8 = _createForOfIteratorHelperLoose(this._watch), _step8; !(_step8 = _iterator8()).done;) {
        var attr = _step8.value;
        var oldVal = oldNode.getAttribute(attr);
        var newVal = newNode.getAttribute(attr);
        if (oldVal !== newVal) {
          swapChanges.push({
            node: newNode,
            key: _key2,
            attribute: attr,
            from: oldVal,
            to: newVal
          });
        }
      }
    }
    var reallyAdded = [];
    for (var _iterator6 = _createForOfIteratorHelperLoose(addedMap), _step6; !(_step6 = _iterator6()).done;) {
      var _step6$value = _step6.value,
        _key3 = _step6$value[0],
        _node2 = _step6$value[1];
      if (!matchedKeys.has(_key3)) {
        reallyAdded.push({
          node: _node2,
          key: _key3
        });
      }
    }
    var reallyRemoved = [];
    for (var _iterator7 = _createForOfIteratorHelperLoose(removedMap), _step7; !(_step7 = _iterator7()).done;) {
      var _step7$value = _step7.value,
        _key4 = _step7$value[0],
        _node3 = _step7$value[1];
      if (!matchedKeys.has(_key4)) {
        reallyRemoved.push({
          node: _node3,
          key: _key4
        });
      }
    }
    return {
      reallyAdded: reallyAdded,
      reallyRemoved: reallyRemoved,
      swapChanges: swapChanges
    };
  }

  /**
   * Emit an event to all listeners, with error isolation.
   */;
  _proto._emit = function _emit(event, entries) {
    for (var _iterator9 = _createForOfIteratorHelperLoose(this._listeners[event]), _step9; !(_step9 = _iterator9()).done;) {
      var handler = _step9.value;
      try {
        handler(entries);
      } catch (err) {
        console.error('HyperChange: error in "' + event + '" handler:', err);
      }
    }
  };
  return HyperChange;
}();

/**
 * Geometry — create, update, remove Leaflet objects from data attributes.
 *
 * Merged from old Geometry/geometry.js + Geometry/events.js.
 * No global Config dependency — receives options/eventTarget from hyperleaflet.js.
 */

// --- Coordinate parsing ---

function parseGeometry(raw) {
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch (_unused) {
      console.warn('hyperleaflet: failed to parse geometry string:', raw);
      return null;
    }
  }
  return null;
}

// --- Geometry type registry ---

var GEOMETRY_TYPES = {
  point: {
    create: function create(coords, style) {
      return L.marker(coords, style);
    },
    update: function update(obj, coords) {
      return obj.setLatLng(coords);
    },
    convert: function convert(coords, lonLat) {
      return lonLat ? [].concat(coords).reverse() : coords;
    },
    eventShape: 'mono'
  },
  linestring: {
    create: function create(coords, style) {
      return L.polyline(coords, style);
    },
    update: function update(obj, coords) {
      return obj.setLatLngs(coords);
    },
    convert: function convert(coords, lonLat) {
      return lonLat ? L.GeoJSON.coordsToLatLngs(coords, 0) : coords;
    },
    eventShape: 'poly'
  },
  polygon: {
    create: function create(coords, style) {
      return L.polygon(coords, style);
    },
    update: function update(obj, coords) {
      return obj.setLatLngs(coords);
    },
    convert: function convert(coords, lonLat) {
      return lonLat ? L.GeoJSON.coordsToLatLngs(coords, 1) : coords;
    },
    eventShape: 'poly'
  }
};

/**
 * Register a custom geometry type.
 * @param {string} type — lowercase type name
 * @param {{ create, update, convert }} handlers
 */
function addGeometryType(type, handlers) {
  if (!handlers.create || !handlers.update || !handlers.convert) {
    throw new Error('Invalid handlers provided.');
  }
  GEOMETRY_TYPES[type] = handlers;
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
    leafletObj.on('click', function (e) {
      eventTarget.dispatchEvent(new CustomEvent('geometry:click', {
        detail: {
          clickedPoint: e.latlng,
          geometry: leafletObj.getLatLng(),
          id: id
        }
      }));
    });
  } else if (shape === 'poly') {
    leafletObj.on('click', function (e) {
      eventTarget.dispatchEvent(new CustomEvent('geometry:click', {
        detail: {
          clickedPoint: e.latlng,
          geometry: leafletObj.getLatLngs(),
          id: id
        }
      }));
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
function createGeometry(dataset, opts) {
  var _opts$styles;
  var rawGeometry = dataset.geometry,
    geometryType = dataset.geometryType,
    style = dataset.style,
    popup = dataset.popup,
    tooltip = dataset.tooltip,
    id = dataset.id,
    reverseOrder = dataset.reverseOrder;
  var coords = parseGeometry(rawGeometry);
  var typeLower = geometryType.toLowerCase();
  var typeInfo = GEOMETRY_TYPES[typeLower];
  if (!typeInfo) {
    throw new Error("Invalid geometry type: " + geometryType);
  }
  var lonLat = shouldReverse(opts.reverseCoordinateOrder, reverseOrder);
  var converted = typeInfo.convert(coords, lonLat);
  var computedStyle = (_opts$styles = opts.styles) == null || (_opts$styles = _opts$styles[typeLower]) == null ? void 0 : _opts$styles[style];
  var leafletObj = typeInfo.create(converted, computedStyle);
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
function updateGeometry(leafletObj, dataset, opts) {
  var rawGeometry = dataset.geometry,
    geometryType = dataset.geometryType,
    reverseOrder = dataset.reverseOrder;
  var coords = parseGeometry(rawGeometry);
  var typeLower = geometryType.toLowerCase();
  var typeInfo = GEOMETRY_TYPES[typeLower];
  if (!typeInfo) {
    throw new Error("Invalid geometry type: " + geometryType);
  }
  var lonLat = shouldReverse(opts.reverseCoordinateOrder, reverseOrder);
  var converted = typeInfo.convert(coords, lonLat);
  return typeInfo.update(leafletObj, converted);
}

// --- Default options ---

var DEFAULT_OPTIONS = {
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
      ready: true
    },
    geometry: {
      click: true,
      move: false,
      add: false
    },
    hyperleaflet: {
      ready: true
    }
  },
  styles: {}
};
function mergeDeep(target, source) {
  var out = _extends({}, target);
  for (var _i = 0, _Object$keys = Object.keys(source); _i < _Object$keys.length; _i++) {
    var key = _Object$keys[_i];
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
      out[key] = mergeDeep(target[key], source[key]);
    } else {
      out[key] = source[key];
    }
  }
  return out;
}

// --- Config (inline, no separate module) ---

var config = {
  _hyperleaflet: null,
  _options: _extends({}, DEFAULT_OPTIONS, {
    events: JSON.parse(JSON.stringify(DEFAULT_OPTIONS.events))
  }),
  get options() {
    return this._options;
  },
  set options(opts) {
    this._options = mergeDeep(this._options, opts);
  },
  reset: function reset() {
    this._options = _extends({}, DEFAULT_OPTIONS, {
      events: JSON.parse(JSON.stringify(DEFAULT_OPTIONS.events))
    });
  },
  getTarget: function getTarget() {
    var target = this._options.events.target;
    switch (target) {
      case 'window':
        return window;
      case 'document':
        return document;
      case 'hyperleaflet':
      default:
        return this._hyperleaflet;
    }
  }
};

// --- Built-in tile layers ---

var BUILT_IN_TILES = {
  OpenStreetMap: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }),
  EsriWorldImagery: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  })
};
function registerTileLayer(name, _temp) {
  var _ref = _temp === void 0 ? {} : _temp,
    url = _ref.url,
    _ref$minZoom = _ref.minZoom,
    minZoom = _ref$minZoom === void 0 ? 0 : _ref$minZoom,
    _ref$maxZoom = _ref.maxZoom,
    maxZoom = _ref$maxZoom === void 0 ? 18 : _ref$maxZoom,
    tms = _ref.tms;
  if (BUILT_IN_TILES[name]) return;
  BUILT_IN_TILES[name] = new L.TileLayer(url, {
    minZoom: minZoom,
    maxZoom: maxZoom,
    tms: !!tms
  });
}
function parseTileElements(tileNodeList) {
  var tileList = Array.from(tileNodeList);
  var tiles = [];
  for (var _i2 = 0, _tileList = tileList; _i2 < _tileList.length; _i2++) {
    var el = _tileList[_i2];
    var name = el.dataset.tile;
    if (!(name in BUILT_IN_TILES)) {
      var _el$dataset = el.dataset,
        tileUrl = _el$dataset.tileUrl,
        tms = _el$dataset.tms,
        minZoom = _el$dataset.minZoom,
        maxZoom = _el$dataset.maxZoom;
      registerTileLayer(name, {
        url: tileUrl,
        tms: tms,
        minZoom: minZoom,
        maxZoom: maxZoom
      });
    }
    tiles.push({
      name: name,
      tile: BUILT_IN_TILES[name]
    });
  }

  // Find default tile
  var defaultEl = tileList.find(function (t) {
    return 'defaultTile' in t.dataset;
  });
  var defaultTile;
  if (defaultEl && defaultEl.dataset.tile in BUILT_IN_TILES) {
    defaultTile = BUILT_IN_TILES[defaultEl.dataset.tile];
  } else if (tileList.length && tileList[0].dataset.tile in BUILT_IN_TILES) {
    defaultTile = BUILT_IN_TILES[tileList[0].dataset.tile];
  } else {
    defaultTile = BUILT_IN_TILES.OpenStreetMap;
  }
  return {
    defaultTile: defaultTile,
    tiles: tiles
  };
}

// --- Layer groups ---

var layerGroups = {};
function getLayerGroup(name) {
  return layerGroups[name];
}
function createLayerGroup(name, layerControl) {
  var group = L.layerGroup();
  layerGroups[name] = group;
  layerControl.addOverlay(group, name);
  return group;
}
function deleteLayerGroupIfEmpty(name, layerControl) {
  if (!name || !layerGroups[name]) return;
  if (layerGroups[name].getLayers().length) return;
  var group = layerGroups[name];
  delete layerGroups[name];
  layerControl.removeLayer(group);
}

// --- Map creation ---

function safeParsePoint(raw, reverse) {
  try {
    var point = JSON.parse(raw);
    return reverse ? point.reverse() : point;
  } catch (_unused) {
    return [0, 0];
  }
}
function createMap(container) {
  var mapConfig = container.dataset.mapConfig;
  var target = mapConfig ? document.querySelector(mapConfig) : container;
  if (!target) throw new Error('hyperleaflet: no map config found');
  var _target$dataset = target.dataset,
    center = _target$dataset.center,
    zoom = _target$dataset.zoom,
    minZoom = _target$dataset.minZoom,
    maxZoom = _target$dataset.maxZoom;
  var reverse = config.options.reverseCoordinateOrder;
  var leafletMap = L.map(container, {
    center: safeParsePoint(center, reverse),
    zoom: zoom || 1,
    minZoom: minZoom || 0,
    maxZoom: maxZoom || 18
  });
  return [leafletMap, target];
}

// --- Map events ---

var STATE_EVENTS = ['zoomstart', 'zoomend', 'movestart', 'moveend', 'zoom', 'move'];
var MOUSE_EVENTS = ['click', 'dblclick', 'mousedown', 'mouseover', 'mouseout', 'mousemove', 'contextmenu', 'preclick'];
function createStateEvent(map, name, leafletEvent) {
  var bounds = map.getBounds();
  return new CustomEvent(name, {
    detail: {
      zoom: map.getZoom(),
      center: map.getCenter(),
      bbox: {
        min: bounds.getSouthWest(),
        max: bounds.getNorthEast()
      },
      bboxString: bounds.toBBoxString(),
      _leafletEvent: leafletEvent
    }
  });
}
function bindMapEvents(map, eventTarget) {
  var mapEvents = config.options.events.map;
  var _loop = function _loop() {
    var _Object$entries$_i = _Object$entries[_i3],
      name = _Object$entries$_i[0],
      enabled = _Object$entries$_i[1];
    if (!enabled) return 1; // continue
    if (STATE_EVENTS.includes(name)) {
      map.on(name, function (e) {
        return eventTarget.dispatchEvent(createStateEvent(map, "map:" + name, e));
      });
    }
    if (MOUSE_EVENTS.includes(name)) {
      map.on(name, function (e) {
        eventTarget.dispatchEvent(new CustomEvent("map:" + name, {
          detail: {
            point: e.latlng,
            _leafletEvent: e
          }
        }));
      });
    }
  };
  for (var _i3 = 0, _Object$entries = Object.entries(mapEvents); _i3 < _Object$entries.length; _i3++) {
    if (_loop()) continue;
  }
  if (mapEvents.ready) {
    map.whenReady(function () {
      return eventTarget.dispatchEvent(createStateEvent(map, 'map:ready'));
    });
  }
}
function sendHyperleafletReady(map, eventTarget) {
  if (!config.options.events.hyperleaflet.ready) return;
  var bounds = map.getBounds();
  eventTarget.dispatchEvent(new CustomEvent('hyperleaflet:ready', {
    detail: {
      zoom: map.getZoom(),
      center: map.getCenter(),
      bbox: {
        min: bounds.getSouthWest(),
        max: bounds.getNorthEast()
      },
      bboxString: bounds.toBBoxString()
    }
  }));
}

// --- Geometry handler (fixed: uses HyperChange API correctly) ---

// O(1) lookup by data-id instead of O(n) layer scan
var geometryIndex = new Map();
function addNode(node, map, layerControl) {
  var dataset = node.dataset;
  var layerName = dataset.layerName,
    id = dataset.id;
  var target = map;
  if (layerName) {
    var existing = getLayerGroup(layerName);
    if (existing) {
      target = existing;
    } else {
      target = createLayerGroup(layerName, layerControl);
      target.addTo(map);
    }
  }
  var opts = {
    reverseCoordinateOrder: config.options.reverseCoordinateOrder,
    styles: config.options.styles,
    eventTarget: config.getTarget(),
    geometryClickEnabled: config.options.events.geometry.click
  };
  var leafletObj = createGeometry(dataset, opts);
  leafletObj.hlID = id;
  leafletObj.addTo(target);
  geometryIndex.set(id, {
    layer: leafletObj,
    target: target
  });
}
function removeNode(node, layerControl) {
  var id = node.dataset.id;
  var entry = geometryIndex.get(id);
  if (!entry) return;
  entry.target.removeLayer(entry.layer);
  geometryIndex["delete"](id);
  var layerName = node.dataset.layerName;
  deleteLayerGroupIfEmpty(layerName, layerControl);
}

/**
 * Handle attribute change from HyperChange.
 * HyperChange emits: { node, key, attribute, from, to }
 * Old code incorrectly accessed change['data-id'] and change.dataset — FIXED.
 */
function changeNode(change) {
  var id = change.key;
  var entry = geometryIndex.get(id);
  if (!entry) return;
  if (change.attribute === 'data-geometry') {
    var opts = {
      reverseCoordinateOrder: config.options.reverseCoordinateOrder
    };
    updateGeometry(entry.layer, change.node.dataset, opts);
  }
  // Other attribute changes could be handled here in the future
}

// --- Hyperleaflet object ---

var HYPERLEAFLET_DATA_SOURCE = '[data-hyperleaflet-source]';
var Hyperleaflet = {
  map: null,
  target: null,
  _hyperchange: null,
  _layerControl: null,
  initialize: function initialize(mapContainer) {
    if (!mapContainer) {
      console.warn('hyperleaflet: no map container found.');
      return;
    }
    mapContainer.setAttribute('hyperleaflet', '');
    var eventTarget = config.getTarget();
    var _createMap = createMap(mapContainer),
      map = _createMap[0],
      target = _createMap[1];
    this.map = map;
    this.target = target;

    // Tile layers + layer control
    this._layerControl = L.control.layers();
    this._layerControl.addTo(map);
    var tileElements = mapContainer.querySelectorAll('[data-tile]');
    var _parseTileElements = parseTileElements(tileElements),
      defaultTile = _parseTileElements.defaultTile,
      tiles = _parseTileElements.tiles;
    for (var _iterator = _createForOfIteratorHelperLoose(tiles), _step; !(_step = _iterator()).done;) {
      var _step$value = _step.value,
        name = _step$value.name,
        tile = _step$value.tile;
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
  _initDataSource: function _initDataSource(eventTarget) {
    var _this = this;
    var source = document.querySelector(HYPERLEAFLET_DATA_SOURCE);
    if (!source) return;
    var layerControl = this._layerControl;
    var map = this.map;
    this._hyperchange = new HyperChange(source, {
      key: 'data-id',
      watch: ['data-geometry']
    });
    this._hyperchange.on('add', function (entries) {
      for (var _iterator2 = _createForOfIteratorHelperLoose(entries), _step2; !(_step2 = _iterator2()).done;) {
        var entry = _step2.value;
        addNode(entry.node, map, layerControl);
      }
    });
    this._hyperchange.on('remove', function (entries) {
      for (var _iterator3 = _createForOfIteratorHelperLoose(entries), _step3; !(_step3 = _iterator3()).done;) {
        var entry = _step3.value;
        removeNode(entry.node, layerControl);
      }
    });
    this._hyperchange.on('change', function (entries) {
      for (var _iterator4 = _createForOfIteratorHelperLoose(entries), _step4; !(_step4 = _iterator4()).done;) {
        var entry = _step4.value;
        changeNode(entry);
      }
    });

    // Process initial elements already in the DOM
    map.whenReady(function () {
      _this._hyperchange.scan();
    });
  },
  // --- Public API ---
  getZoom: function getZoom() {
    return this.map.getZoom();
  },
  setZoom: function setZoom(zoom) {
    this.map.setZoom(zoom);
  },
  getCenter: function getCenter() {
    return this.map.getCenter();
  },
  getBounds: function getBounds() {
    return this.map.getBounds();
  },
  getBBoxString: function getBBoxString() {
    return this.map.getBounds().toBBoxString();
  },
  panTo: function panTo(center) {
    this.map.panTo(center);
  },
  flyTo: function flyTo(center, zoom) {
    this.map.flyTo(center, zoom || this.map.getZoom());
  },
  flyToBounds: function flyToBounds(bounds) {
    this.map.flyToBounds(bounds);
  },
  fitBounds: function fitBounds(bounds) {
    this.map.fitBounds(bounds);
  },
  addGeometryType: function addGeometryType$1(type, handlers) {
    addGeometryType(type, handlers);
  }
};

// Expose config on Hyperleaflet
Hyperleaflet.config = config;
config._hyperleaflet = Hyperleaflet;

// Make Hyperleaflet act as an EventTarget for addEventListener/removeEventListener/dispatchEvent
var _eventListeners = {};
Hyperleaflet.addEventListener = function (type, listener) {
  if (!(type in _eventListeners)) _eventListeners[type] = [];
  _eventListeners[type].push(listener);
};
Hyperleaflet.removeEventListener = function (type, listener) {
  if (!(type in _eventListeners)) return;
  var idx = _eventListeners[type].indexOf(listener);
  if (idx !== -1) _eventListeners[type].splice(idx, 1);
};
Hyperleaflet.dispatchEvent = function (event) {
  if (!(event.type in _eventListeners)) return true;
  for (var _iterator5 = _createForOfIteratorHelperLoose(_eventListeners[event.type].slice()), _step5; !(_step5 = _iterator5()).done;) {
    var listener = _step5.value;
    listener.call(Hyperleaflet, event);
  }
  return !event.defaultPrevented;
};

/**
 * Hyperleaflet entry point.
 *
 * Auto-initializes on DOMContentLoaded. If #map isn't in the DOM yet
 * (SPA routing), watches for it with a body MutationObserver.
 */
function initializeMap() {
  var container = document.querySelector(Hyperleaflet.config.options.mapElement);
  if (container) {
    Hyperleaflet.initialize(container);
    return true;
  }
  return false;
}
function observeMap() {
  var observer = new MutationObserver(function (_mutations, obs) {
    if (initializeMap()) {
      obs.disconnect();
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    if (!initializeMap()) {
      observeMap();
    }
  });
})();
window.hyperleaflet = Hyperleaflet;

export { Hyperleaflet as hyperleaflet };
//# sourceMappingURL=hyperleaflet.esm.js.map
