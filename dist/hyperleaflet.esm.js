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
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
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

var hyperChangeDetection = {
  events: {},
  /** @param {{ targetSelector: string, uniqueAttribute: string, attributeFilter: string[] }} options */observe: function observe(_ref) {
    var targetSelector = _ref.targetSelector,
      uniqueAttribute = _ref.uniqueAttribute,
      attributeFilter = _ref.attributeFilter;
    if (this.events[targetSelector]) {
      throw new Error("Can't observe the same target twice");
    }
    observeChangesInTarget(targetSelector, uniqueAttribute, attributeFilter);
    this.events[targetSelector] = {};
  },
  /** @param {string} targetSelector @param {string} evName @param {Function} callback */subscribe: function subscribe(targetSelector, evName, callback) {
    this.events[targetSelector][evName] = this.events[targetSelector][evName] || [];
    this.events[targetSelector][evName].push(callback);
  },
  /** @param {string} targetSelector @param {string} evName @param {Function} callback */unsubscribe: function unsubscribe(targetSelector, evName, callback) {
    if (this.events[targetSelector][evName]) {
      this.events[targetSelector][evName] = this.events[targetSelector][evName].filter(function (f) {
        return f !== callback;
      });
    }
  },
  /** @param {string} targetSelector @param {string} evName @param {*} data */publish: function publish(targetSelector, evName, data) {
    if (this.events[targetSelector][evName]) {
      this.events[targetSelector][evName].forEach(function (f) {
        return f(data);
      });
    }
  }
};
function observeChangesInTarget(targetSelector, uniqueAttribute, attributeFilter) {
  var isEqualNode = function isEqualNode(oldNode, newNode, attributes) {
    return attributes.every(function (attribute) {
      return oldNode.getAttribute(attribute) === newNode.getAttribute(attribute);
    });
  };
  function findNodesWithAttribute(nodes) {
    var result = [];
    nodes.forEach(function (node) {
      if (node.nodeType === 1) {
        if (node.hasAttribute(uniqueAttribute)) {
          result.push(node);
        }
        result.push.apply(result, findNodesWithAttribute(node.childNodes));
      }
    });
    return result;
  }
  var observer = new MutationObserver(function (mutationsList) {
    var removedNodes = [];
    var addedNodes = [];
    mutationsList.forEach(function (mutation) {
      if (mutation.type === 'childList') {
        removedNodes.push.apply(removedNodes, findNodesWithAttribute(mutation.removedNodes));
        addedNodes.push.apply(addedNodes, findNodesWithAttribute(mutation.addedNodes));
      } else if (mutation.type === 'attributes') {
        var _attributeChange;
        var attribute = mutation.attributeName;
        var attributeChange = (_attributeChange = {
          attribute: attribute,
          from: mutation.oldValue,
          to: mutation.target.getAttribute(attribute)
        }, _attributeChange[uniqueAttribute] = mutation.target.getAttribute(uniqueAttribute), _attributeChange);
        var changedNode = [_extends({
          dataset: mutation.target.dataset
        }, attributeChange)];
        hyperChangeDetection.publish(targetSelector, 'node_changes', changedNode);
      }
    });
    var changedNodes = [];
    var removedNodeMap = new Map(removedNodes.map(function (node) {
      return [node.getAttribute(uniqueAttribute), node];
    }));
    var jointNodeSet = new Set();
    addedNodes.forEach(function (addNode) {
      var addNodeId = addNode.getAttribute(uniqueAttribute);
      var oldNode = removedNodeMap.get(addNodeId);
      if (oldNode) {
        jointNodeSet.add(addNodeId);
      }
      if (oldNode && !isEqualNode(oldNode, addNode, attributeFilter)) {
        var attributeChanges = attributeFilter.reduce(function (changes, attr) {
          var from = oldNode.getAttribute(attr);
          var to = addNode.getAttribute(attr);
          if (from !== to) {
            var _changes$push;
            changes.push((_changes$push = {
              attribute: attr,
              from: from,
              to: to
            }, _changes$push[uniqueAttribute] = addNodeId, _changes$push));
          }
          return changes;
        }, []);
        changedNodes.push(_extends({}, attributeChanges, {
          dataset: addNode.dataset
        }));
      }
    });
    var reallyRemovedNodes = removedNodes.filter(function (node) {
      return !jointNodeSet.has(node.getAttribute(uniqueAttribute));
    });
    var reallyAddedNodes = addedNodes.filter(function (node) {
      return !jointNodeSet.has(node.getAttribute(uniqueAttribute));
    });
    if (reallyAddedNodes.length) {
      hyperChangeDetection.publish(targetSelector, 'node_adds', reallyAddedNodes);
    }
    if (changedNodes.length) {
      hyperChangeDetection.publish(targetSelector, 'node_changes', changedNodes);
    }
    if (reallyRemovedNodes.length) {
      hyperChangeDetection.publish(targetSelector, 'node_removes', reallyRemovedNodes);
    }
  });
  var targetNode = document.querySelector(targetSelector);
  observer.observe(targetNode, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: attributeFilter,
    attributeOldValue: true
  });
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}
function mergeDeep(target, source) {
  var output = _extends({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(function (key) {
      if (isObject(source[key])) {
        if (key in target && isObject(target[key])) {
          output[key] = mergeDeep(target[key], source[key]);
        } else {
          output[key] = source[key];
        }
      } else {
        output[key] = source[key];
      }
    });
  }
  return output;
}

var defaultOptions = {
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
var Config = {
  _hyperleaflet: null,
  _options: defaultOptions,
  get options() {
    return this._options;
  },
  set options(options) {
    this._options = mergeDeep(this._options, options);
  },
  reset: function reset() {
    this._options = defaultOptions;
  },
  getTarget: function getTarget() {
    var target = this.options.events.target;
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

function createStateEvent(map, eventName, _leafletEvent) {
  var bounds = map.getBounds();
  var min = bounds.getSouthWest();
  var max = bounds.getNorthEast();
  var bboxString = bounds.toBBoxString();
  return new CustomEvent(eventName, {
    detail: {
      zoom: map.getZoom(),
      center: map.getCenter(),
      bbox: {
        min: min,
        max: max
      },
      bboxString: bboxString,
      _leafletEvent: _leafletEvent
    }
  });
}
var stateEvents = ['zoomstart', 'zoomend', 'movestart', 'moveend', 'zoom', 'move'];
var mouseEvents = ['click', 'dblclick', 'mousedown', 'mouseover', 'mouseout', 'mousemove', 'contextmenu', 'preclick'];
function setMapEvents(map) {
  var eventTarget = Config.getTarget('map');
  var mapEvents = Config.options.events.map;
  Object.entries(mapEvents).forEach(function (_ref) {
    var eventName = _ref[0],
      value = _ref[1];
    if (value) {
      if (stateEvents.includes(eventName)) {
        map.on(eventName, function (e) {
          var event = createStateEvent(map, "map:" + eventName, e);
          eventTarget.dispatchEvent(event);
        });
      }
      if (mouseEvents.includes(eventName)) {
        map.on(eventName, function (e) {
          var event = new CustomEvent("map:" + eventName, {
            detail: {
              point: e.latlng
            },
            _leafletEvent: e
          });
          eventTarget.dispatchEvent(event);
        });
      }
    }
  });
  if (mapEvents.ready) {
    map.whenReady(function () {
      var event = createStateEvent(map, 'map:ready');
      eventTarget.dispatchEvent(event);
    });
  }
}

function reverseCoordinates(point) {
  return point.reverse();
}
function safeParsePoint(pointJson, reverse) {
  if (reverse === void 0) {
    reverse = false;
  }
  try {
    var point = JSON.parse(pointJson);
    return reverse ? reverseCoordinates(point) : point;
  } catch (_) {
    return [0, 0];
  }
}
var Map_ = {
  map: null,
  create: function create(mapContainer) {
    var config = Config;
    var mapConfig = mapContainer.dataset.mapConfig;
    var target = mapConfig ? document.querySelector(mapConfig) : mapContainer;
    if (!target) throw new Error('No map config found');
    var _target$dataset = target.dataset,
      center = _target$dataset.center,
      zoom = _target$dataset.zoom,
      minZoom = _target$dataset.minZoom,
      maxZoom = _target$dataset.maxZoom;
    var reverseCoordinateOrder = config.options.reverseCoordinateOrder;
    var mapView = {
      center: safeParsePoint(center, reverseCoordinateOrder),
      zoom: zoom || 1
    };
    var leafletMap = L.map(mapContainer, {
      center: mapView.center,
      zoom: mapView.zoom,
      minZoom: minZoom || 0,
      maxZoom: maxZoom || 18
    });
    setMapEvents(leafletMap);
    return [leafletMap, target];
  }
};

function setEvents(leafletObject, id, eventType) {
  var eventTarget = Config.getTarget('map');
  if (Config.options.events.geometry.click) {
    if (eventType === 'mono') {
      leafletObject.on('click', function (e) {
        var event = new CustomEvent('geometry:click', {
          detail: {
            clickedPoint: e.latlng,
            geometry: leafletObject.getLatLng(),
            id: id
          }
        });
        eventTarget.dispatchEvent(event);
      });
    } else if (eventType === 'poly') {
      leafletObject.on('click', function (e) {
        var event = new CustomEvent('geometry:click', {
          detail: {
            clickedPoint: e.latlng,
            geometry: leafletObject.getLatLngs(),
            id: id
          }
        });
        eventTarget.dispatchEvent(event);
      });
    } else {
      throw new Error('Invalid event type');
    }
  }
}
function sendEvent(eventType, leafletGeometry, id, geometryType, target) {
  var eventTarget = Config.getTarget('map');
  if (Config.options.events.geometry.add) {
    var event = new CustomEvent("geometry:" + eventType, {
      detail: {
        id: id,
        geometryType: geometryType,
        target: target
      }
    });
    eventTarget.dispatchEvent(event);
  }
}

var _excluded = ["reverseOrder"];
var convertGeometryCoordinates = function convertGeometryCoordinates(geometry) {
  if (typeof geometry === 'string') {
    try {
      return JSON.parse(geometry);
    } catch (error) {
      console.warn('Failed to parse the geometry string.');
      return null;
    }
  }
  return null;
};
var createHyperleafletGeometryParams = function createHyperleafletGeometryParams(dataset) {
  var _styles$geometryType;
  var hyperleafletOptions = Config.options;
  var geometry = dataset.geometry,
    geometryType = dataset.geometryType,
    style = dataset.style,
    popup = dataset.popup,
    tooltip = dataset.tooltip,
    id = dataset.id;
  var styles = hyperleafletOptions.styles;
  var convertedGeometry = convertGeometryCoordinates(geometry);
  var computedStyle = styles == null || (_styles$geometryType = styles[geometryType]) == null ? void 0 : _styles$geometryType[style];
  var options = {
    style: computedStyle,
    popup: popup,
    tooltip: tooltip,
    id: id
  };
  return {
    geometry: convertedGeometry,
    geometryType: geometryType,
    options: options
  };
};
var Geometry = {
  types: {
    point: {
      create: function create(geometry, styleOptions, _extraParams) {
        return L.marker(geometry, styleOptions);
      },
      update: function update(leafletObject, geometry) {
        return leafletObject.setLatLng(geometry);
      },
      convert: function convert(geometry, isLonLat) {
        return isLonLat ? [].concat(geometry).reverse() : geometry;
      },
      eventType: 'mono'
    },
    linestring: {
      create: function create(geometry, styleOptions, _extraParams) {
        return L.polyline(geometry, styleOptions);
      },
      update: function update(leafletObject, geometry) {
        return leafletObject.setLatLngs(geometry);
      },
      convert: function convert(geometry, isLonLat) {
        return isLonLat ? L.GeoJSON.coordsToLatLngs(geometry, 0) : geometry;
      },
      eventType: 'poly'
    },
    polygon: {
      create: function create(geometry, styleOptions, _extraParams) {
        return L.polygon(geometry, styleOptions);
      },
      update: function update(leafletObject, geometry) {
        return leafletObject.setLatLngs(geometry);
      },
      convert: function convert(geometry, isLonLat) {
        return isLonLat ? L.GeoJSON.coordsToLatLngs(geometry, 1) : geometry;
      },
      eventType: 'poly'
    }
  },
  addType: function addType(type, handlers) {
    if (!handlers.create || !handlers.update || !handlers.convert) {
      throw new Error('Invalid handlers provided.');
    }
    this.types[type] = handlers;
  },
  shouldReverseCoordinates: function shouldReverseCoordinates(reverseCoordinateOrder, reverseOrder) {
    return reverseCoordinateOrder || reverseOrder !== undefined;
  },
  applyPopupAndTooltip: function applyPopupAndTooltip(leafletGeometry, options) {
    if (options.popup) {
      leafletGeometry.bindPopup(options.popup);
    }
    if (options.tooltip) {
      leafletGeometry.bindTooltip(options.tooltip);
    }
  },
  createGeometry: function createGeometry(dataset) {
    var reverseOrder = dataset.reverseOrder,
      extraOptions = _objectWithoutPropertiesLoose(dataset, _excluded);
    var reverseCoordinateOrder = Config.options.reverseCoordinateOrder;
    var _createHyperleafletGe = createHyperleafletGeometryParams(dataset),
      geometry = _createHyperleafletGe.geometry,
      geometryType = _createHyperleafletGe.geometryType,
      options = _createHyperleafletGe.options;
    var geometryCreator = this.types[geometryType.toLowerCase()];
    var isLonLat = this.shouldReverseCoordinates(reverseCoordinateOrder, reverseOrder);
    if (!geometryCreator) {
      throw new Error("Invalid geometry type: " + geometryType);
    }
    var convertedGeometry = geometryCreator.convert(geometry, isLonLat);
    var leafletGeometry = geometryCreator.create(convertedGeometry, options.style, extraOptions);
    this.applyPopupAndTooltip(leafletGeometry, options);
    setEvents(leafletGeometry, options.id, geometryCreator.eventType);
    return leafletGeometry;
  },
  updateGeometry: function updateGeometry(leafletObject, dataset) {
    var reverseOrder = dataset.reverseOrder;
    var reverseCoordinateOrder = Config.options.reverseCoordinateOrder;
    var isLonLat = this.shouldReverseCoordinates(reverseCoordinateOrder, reverseOrder);
    var _createHyperleafletGe2 = createHyperleafletGeometryParams(dataset),
      geometry = _createHyperleafletGe2.geometry,
      geometryType = _createHyperleafletGe2.geometryType;
    var typeInfo = this.types[geometryType.toLowerCase()];
    if (!typeInfo) {
      throw new Error("Invalid geometry type: " + geometryType);
    }
    var convertedGeometry = typeInfo.convert(geometry, isLonLat);
    return typeInfo.update(leafletObject, convertedGeometry);
  }
};

function createGeometryHandler(map, layerModule) {
  function addNodeToHyperleaflet(node) {
    var dataset = node.dataset,
      _node$dataset = node.dataset,
      layerName = _node$dataset.layerName,
      id = _node$dataset.id;
    var target = map;
    if (layerName) {
      var layer = layerModule.getLayerGroup(layerName);
      if (!layer) {
        target = layerModule.createLayerGroup(layerName);
        target.addTo(map);
      } else {
        target = layer;
      }
    }
    var leafletGeometry = Geometry.createGeometry(dataset);
    sendEvent('add', leafletGeometry, id, dataset.geometryType, target);
    leafletGeometry.hlID = id;
    leafletGeometry.addTo(target);
  }
  function deleteNodeFromHyperleaflet(node) {
    var rowId = node.dataset.id;
    var layerName = node.dataset.layerName;
    var layer = layerModule.getLayerGroup(layerName);
    var target = layer || map;
    var leafletLayers = Object.values(target._layers);
    var leafletObject = leafletLayers.find(function (_layer) {
      return _layer.hlID === rowId;
    });
    target.removeLayer(leafletObject);
    sendEvent('remove', leafletObject, rowId, node.dataset.geometryType, target);
    layerModule.deleteLayerGroup(layerName, {
      ifEmpty: true
    });
  }
  function changeNodeInHyperleaflet(change) {
    var rowId = change['data-id'];
    var leafletLayers = Object.values(map._layers);
    var leafletObject = leafletLayers.find(function (layer) {
      return layer.hlID === rowId;
    });
    switch (change.attribute) {
      case 'data-geometry':
        {
          sendEvent('change', leafletObject, rowId, change.dataset.geometryType, map);
          return Geometry.updateGeometry(leafletObject, change.dataset);
        }
      default:
        {
          throw new Error('Unsupported attribute change!');
        }
    }
  }
  return {
    addNodeToHyperleaflet: addNodeToHyperleaflet,
    deleteNodeFromHyperleaflet: deleteNodeFromHyperleaflet,
    changeNodeInHyperleaflet: changeNodeInHyperleaflet
  };
}

function sendHyperleafletReady(map) {
  var eventTarget = Config.getTarget('hyperleaflet');
  if (Config.options.events.hyperleaflet.ready) {
    var bounds = map.getBounds();
    var min = bounds.getSouthWest();
    var max = bounds.getNorthEast();
    var bboxString = bounds.toBBoxString();
    var event = new CustomEvent('hyperleaflet:ready', {
      detail: {
        zoom: map.getZoom(),
        center: map.getCenter(),
        bbox: {
          min: min,
          max: max
        },
        bboxString: bboxString
      }
    });
    eventTarget.dispatchEvent(event);
  }
}

var Layers = {
  control: L.control.layers(),
  layerGroups: {},
  addBaseLayer: function addBaseLayer(baseLayer, layerName) {
    this.control.addBaseLayer(baseLayer, layerName);
  },
  getLayerGroup: function getLayerGroup(layerName) {
    var _this$layerGroups;
    return (_this$layerGroups = this.layerGroups) == null ? void 0 : _this$layerGroups[layerName];
  },
  createLayerGroup: function createLayerGroup(layerName) {
    var layerGroup = L.layerGroup();
    this.layerGroups[layerName] = layerGroup;
    this.control.addOverlay(layerGroup, layerName);
    return layerGroup;
  },
  deleteLayerGroup: function deleteLayerGroup(layerName, options) {
    if (options === void 0) {
      options = {
        ifEmpty: false
      };
    }
    if (options.ifEmpty && this.layerGroups[layerName].getLayers().length) {
      return;
    }
    var layerGroup = this.layerGroups[layerName];
    delete this.layerGroups[layerName];
    this.control.removeLayer(layerGroup);
  }
};

var TileLayers = {
  _tileLayers: {
    OpenStreetMap: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }),
    EsriWorldImagery: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    })
  },
  _addTileLayer: function _addTileLayer(name, _temp) {
    var _ref = _temp === void 0 ? {} : _temp,
      url = _ref.url,
      _ref$minZoom = _ref.minZoom,
      minZoom = _ref$minZoom === void 0 ? 0 : _ref$minZoom,
      _ref$maxZoom = _ref.maxZoom,
      maxZoom = _ref$maxZoom === void 0 ? 18 : _ref$maxZoom,
      tms = _ref.tms;
    if (this._tileLayers[name]) {
      return;
    }
    var newTileLayer = new L.TileLayer(url, {
      minZoom: minZoom,
      maxZoom: maxZoom,
      tms: !!tms
    });
    this._tileLayers[name] = newTileLayer;
  },
  _getDefaultHyperleafletTile: function _getDefaultHyperleafletTile(tileLayerElementList) {
    var defaultTileLayerElement = tileLayerElementList.find(function (t) {
      return 'defaultTile' in t.dataset;
    });
    if (defaultTileLayerElement && defaultTileLayerElement.dataset.tile in this._tileLayers) {
      return this._tileLayers[defaultTileLayerElement.dataset.tile];
    }
    if (tileLayerElementList.length && tileLayerElementList[0].dataset.tile in this._tileLayers) {
      return this._tileLayers[tileLayerElementList[0].dataset.tile];
    }
    return this._tileLayers.OpenStreetMap;
  },
  tiles: [],
  defaultTile: undefined,
  nodesToTiles: function nodesToTiles(tileLayerElementNodeList) {
    var _this = this;
    var tileLayerElementList = Array.from(tileLayerElementNodeList);
    tileLayerElementList.forEach(function (tileLayerElement) {
      var tile = tileLayerElement.dataset.tile;
      if (!(tile in _this._tileLayers)) {
        var _tileLayerElement$dat = tileLayerElement.dataset,
          tileUrl = _tileLayerElement$dat.tileUrl,
          tms = _tileLayerElement$dat.tms,
          minZoom = _tileLayerElement$dat.minZoom,
          maxZoom = _tileLayerElement$dat.maxZoom;
        _this._addTileLayer(tile, {
          url: tileUrl,
          tms: tms,
          minZoom: minZoom,
          maxZoom: maxZoom
        });
      }
      _this.tiles.push({
        name: tile,
        tile: _this._tileLayers[tile]
      });
    });
    this.defaultTile = this._getDefaultHyperleafletTile(tileLayerElementList);
    return {
      defaultTile: this.defaultTile,
      tiles: this.tiles
    };
  }
};

function makeEventTarget(object) {
  var eventListeners = {};
  Object.assign(object, {
    addEventListener: function addEventListener(type, listener) {
      if (!(type in eventListeners)) {
        eventListeners[type] = [];
      }
      eventListeners[type].push(listener);
    },
    removeEventListener: function removeEventListener(type, listener) {
      if (!(type in eventListeners)) {
        return;
      }
      var index = eventListeners[type].indexOf(listener);
      if (index !== -1) {
        eventListeners[type].splice(index, 1);
      }
    },
    dispatchEvent: function dispatchEvent(event) {
      if (!(event.type in eventListeners)) {
        return true;
      }
      var listeners = eventListeners[event.type].slice();
      for (var _iterator = _createForOfIteratorHelperLoose(listeners), _step; !(_step = _iterator()).done;) {
        var listener = _step.value;
        listener.call(object, event);
      }
      return !event.defaultPrevented;
    }
  });
}

var HYPERLEAFLET_DATA_SOURCE = '[data-hyperleaflet-source]';
var Hyperleaflet = {
  beforeNodeAdd: [],
  afterNodeAdd: [],
  beforeNodeRemove: [],
  afterNodeRemove: [],
  beforeNodeChange: [],
  afterNodeChange: [],
  addNode: [],
  removeNode: [],
  changeNode: [],
  customMapEvents: [],
  initialize: function initialize(mapContainer) {
    var _this = this;
    if (!mapContainer) {
      console.warn('Hyperleaflet: No map container found.');
      return;
    }
    mapContainer.setAttribute('hyperleaflet', '');
    var _Map_$create = Map_.create(mapContainer),
      map = _Map_$create[0],
      target = _Map_$create[1];
    this.map = map;
    this.target = target;
    this.initializeLayerControl(mapContainer, this.map);
    this.initializeHyperleafletDataSource();
    this.customMapEvents.forEach(function (hook) {
      return hook(_this.map, _this.target);
    });
    sendHyperleafletReady(this.map);
  },
  addExtension: function addExtension(extension) {
    var _this2 = this;
    if (extension.layer) {
      Layers.control.addOverlay(extension.layer);
    }
    if (extension.handleMap) {
      this.customMapEvents.push(function (map, mapTarget) {
        return extension.handleMap(map, mapTarget);
      });
    }
    var functionNames = ['addNode', 'removeNode', 'changeNode', 'beforeNodeAdd', 'afterNodeAdd', 'beforeNodeRemove', 'afterNodeRemove', 'beforeNodeChange', 'afterNodeChange'];
    functionNames.forEach(function (functionName) {
      if (extension[functionName] && typeof extension[functionName] === 'function') {
        _this2[functionName].push(function (node) {
          return extension[functionName](node);
        });
      }
    });
  },
  initializeHyperleafletDataSource: function initializeHyperleafletDataSource() {
    var _this3 = this;
    var hyperleafletDataSource = document.querySelector(HYPERLEAFLET_DATA_SOURCE);
    if (!hyperleafletDataSource) return;
    var _createGeometryHandle = createGeometryHandler(this.map, Layers),
      addNodeToHyperleaflet = _createGeometryHandle.addNodeToHyperleaflet,
      deleteNodeFromHyperleaflet = _createGeometryHandle.deleteNodeFromHyperleaflet,
      changeNodeInHyperleaflet = _createGeometryHandle.changeNodeInHyperleaflet;
    this.map.whenReady(function () {
      var nodes = hyperleafletDataSource.querySelectorAll('[data-id]');
      nodes.forEach(function (node) {
        _this3.beforeNodeAdd.forEach(function (hook) {
          return hook(node);
        });
        if (node.dataset.hyperleafletExtension) {
          _this3.addNode.forEach(function (hook) {
            return hook(node);
          });
        } else {
          addNodeToHyperleaflet(node);
        }
        _this3.afterNodeAdd.forEach(function (hook) {
          return hook(node);
        });
      });
    });
    hyperChangeDetection.observe({
      targetSelector: HYPERLEAFLET_DATA_SOURCE,
      uniqueAttribute: 'data-id',
      attributeFilter: ['data-geometry']
    });
    hyperChangeDetection.subscribe(HYPERLEAFLET_DATA_SOURCE, 'node_adds', function (nodes) {
      nodes.forEach(function (node) {
        _this3.beforeNodeAdd.forEach(function (hook) {
          return hook(node);
        });
        if (node.dataset.hyperleafletExtension) {
          _this3.addNode.forEach(function (hook) {
            return hook(node);
          });
        } else {
          addNodeToHyperleaflet(node);
        }
        _this3.afterNodeAdd.forEach(function (hook) {
          return hook(node);
        });
      });
    });
    hyperChangeDetection.subscribe(HYPERLEAFLET_DATA_SOURCE, 'node_removes', function (nodes) {
      nodes.forEach(function (node) {
        _this3.beforeNodeRemove.forEach(function (hook) {
          return hook(node);
        });
        if (node.dataset.hyperleafletExtension) {
          _this3.removeNode.forEach(function (hook) {
            return hook(node);
          });
        } else {
          deleteNodeFromHyperleaflet(node);
        }
        _this3.afterNodeRemove.forEach(function (hook) {
          return hook(node);
        });
      });
    });
    hyperChangeDetection.subscribe(HYPERLEAFLET_DATA_SOURCE, 'node_changes', function (changes) {
      changes.forEach(function (change) {
        _this3.beforeNodeChange.forEach(function (hook) {
          return hook(change);
        });
        if (change.dataset.hyperleafletExtension) {
          _this3.changeNode.forEach(function (hook) {
            return hook(change);
          });
        } else {
          changeNodeInHyperleaflet(change);
        }
        _this3.afterNodeChange.forEach(function (hook) {
          return hook(change);
        });
      });
    });
  },
  initializeLayerControl: function initializeLayerControl(mapContainer) {
    var tileLayerElementList = mapContainer.querySelectorAll('[data-tile]');
    var _TileLayers$nodesToTi = TileLayers.nodesToTiles(tileLayerElementList),
      defaultTile = _TileLayers$nodesToTi.defaultTile,
      tiles = _TileLayers$nodesToTi.tiles;
    var layerControl = Layers.control;
    layerControl.addTo(this.map);
    tiles.forEach(function (_ref) {
      var name = _ref.name,
        tile = _ref.tile;
      Layers.addBaseLayer(tile, name);
    });
    defaultTile.addTo(this.map);
  },
  getZoom: function getZoom() {
    return this.map.getZoom();
  },
  setZoom: function setZoom(zoom) {
    this.map.setZoom(zoom);
  },
  getCenter: function getCenter() {
    return this.map.getCenter();
  },
  fitBounds: function fitBounds(bounds) {
    this.map.fitBounds(bounds);
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
    if (zoom === void 0) {
      zoom = undefined;
    }
    zoom = zoom || this.map.getZoom();
    this.map.flyTo(center, zoom);
  },
  flyToBounds: function flyToBounds(bounds) {
    this.map.flyToBounds(bounds);
  }
};
Hyperleaflet.addGeometryType = function (type, customGeometryType) {
  Geometry.addType(type, customGeometryType);
};
makeEventTarget(Hyperleaflet);
Hyperleaflet.config = Config;
Config._hyperleaflet = Hyperleaflet;

function initializeMap() {
  var mapContainer = document.querySelector(Config.options.mapElement);
  if (mapContainer) {
    Hyperleaflet.initialize(mapContainer);
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
