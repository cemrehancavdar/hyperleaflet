import { tileLayer, control, TileLayer, map, marker, GeoJSON, polyline, polygon } from 'leaflet';

var tileLayers = {
  OpenStreetMap: tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }),
  EsriWorldImagery: tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  })
};
function addTileLayer(newTileLayer) {
  if (tileLayers[newTileLayer.name]) {
    console.warn("Tile layer " + newTileLayer.name + " already exists. Skipping.");
    return;
  }
  tileLayers[newTileLayer.name] = newTileLayer.tile;
}

function createGenericMapEvent(map, eventName) {
  var bounds = map.getBounds();
  var min = bounds.getSouthWest();
  var max = bounds.getNorthEast();
  var bboxString = bounds.toBBoxString();
  var event = new CustomEvent(eventName, {
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
  return event;
}
function setMapEvents(map) {
  map.on('click', function (e) {
    var event = new CustomEvent('map:click', {
      detail: {
        point: e.latlng
      }
    });
    window.dispatchEvent(event);
  });
  map.whenReady(function () {
    var event = createGenericMapEvent(map, 'map:load');
    window.dispatchEvent(event);
  });
  map.on('zoomend', function () {
    var event = createGenericMapEvent(map, 'map:zoom');
    window.dispatchEvent(event);
  });
  map.on('move', function () {
    var event = createGenericMapEvent(map, 'map:move');
    window.dispatchEvent(event);
  });
  return map;
}
function sendHyperleafletReady(map) {
  var event = createGenericMapEvent(map, 'hyperleaflet:ready');
  window.dispatchEvent(event);
}

function createCustomTileLayer(url, _temp) {
  var _ref = _temp === void 0 ? {} : _temp,
    minZoom = _ref.minZoom,
    maxZoom = _ref.maxZoom,
    tms = _ref.tms;
  return new TileLayer(url, {
    minZoom: minZoom || 0,
    maxZoom: maxZoom || 18,
    tms: !!tms
  });
}
function createTileController(tiles) {
  return tiles.length ? control.layers(Object.fromEntries(tiles.map(function (_ref2) {
    var name = _ref2.name,
      tile = _ref2.tile;
    return [name, tile];
  }))) : null;
}
function parseTileLayerElement(tileLayerElement) {
  var _tileLayerElement$dat = tileLayerElement.dataset,
    tile = _tileLayerElement$dat.tile,
    tileUrl = _tileLayerElement$dat.tileUrl,
    tms = _tileLayerElement$dat.tms,
    minZoom = _tileLayerElement$dat.minZoom,
    maxZoom = _tileLayerElement$dat.maxZoom;
  if (tileUrl) {
    var newTile = createCustomTileLayer(tileUrl, {
      minZoom: minZoom,
      maxZoom: maxZoom,
      tms: tms === 'true'
    });
    addTileLayer({
      name: tile,
      tile: newTile
    });
  }
  var currentTile = tileLayers[tile];
  if (!currentTile) {
    // eslint-disable-next-line no-console
    console.warn(tile + " is not in: \n" + Object.keys(tileLayers).join('\n'));
    return null;
  }
  currentTile.options.minZoom = minZoom;
  currentTile.options.maxZoom = maxZoom;
  return {
    tile: currentTile,
    name: tile
  };
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

var hyperleafletConfig = {
  reverseOrderAll: false
};

function getDefaultHyperleafletTile(tileLayerElementList) {
  var defaultTileLayerElement = tileLayerElementList.find(function (t) {
    return 'defaultTile' in t.dataset;
  });
  if (defaultTileLayerElement && defaultTileLayerElement.dataset.tile in tileLayers) {
    return tileLayers[defaultTileLayerElement.dataset.tile];
  }
  if (tileLayerElementList.length && tileLayerElementList[0].dataset.tile in tileLayers) {
    return tileLayers[tileLayerElementList[0].dataset.tile];
  }
  return tileLayers.OpenStreetMap;
}
function createHyperleafletTiles(tileLayerElementNodeList) {
  var tileLayerElementList = Array.from(tileLayerElementNodeList);
  var hyperleafletTiles = tileLayerElementList.map(parseTileLayerElement).filter(Boolean);
  var defaultHyperleafletTile = getDefaultHyperleafletTile(tileLayerElementList);
  var tileController = createTileController(hyperleafletTiles);
  return {
    defaultHyperleafletTile: defaultHyperleafletTile,
    tileController: tileController
  };
}
function createHyperleafletMap(mapElement) {
  var _mapElement$dataset = mapElement.dataset,
    center = _mapElement$dataset.center,
    zoom = _mapElement$dataset.zoom,
    minZoom = _mapElement$dataset.minZoom,
    maxZoom = _mapElement$dataset.maxZoom;
  var reverseOrderAll = hyperleafletConfig.reverseOrderAll;
  var mapView = {
    center: safeParsePoint(center, reverseOrderAll),
    zoom: zoom || 1
  };
  var leafletMap = map(mapElement, {
    center: mapView.center,
    zoom: mapView.zoom,
    minZoom: minZoom || 0,
    maxZoom: maxZoom || 18
  });
  return setMapEvents(leafletMap);
}

function geometryObjectHandler() {
  var geometryObjectElement = document.createElement('script');
  geometryObjectElement.type = 'application/json';
  geometryObjectElement.setAttribute('data-testid', 'json');
  geometryObjectElement.innerText = '{}';
  document.body.appendChild(geometryObjectElement);
  var geometryObject = JSON.parse(geometryObjectElement.text);
  var addToGeometryObject = function addToGeometryObject(node) {
    var _node$dataset = node.dataset,
      id = _node$dataset.id,
      geometry = _node$dataset.geometry,
      geometryType = _node$dataset.geometryType;
    node.removeAttribute('data-geometry');
    geometryObject[id] = {
      type: geometryType,
      coordinates: JSON.parse(geometry)
    };
    geometryObjectElement.text = JSON.stringify(geometryObject, null, 2);
  };
  var removeFromGeometryObject = function removeFromGeometryObject(node) {
    var id = node.dataset.id;
    delete geometryObject[id];
    geometryObjectElement.text = JSON.stringify(geometryObject, null, 2);
  };
  return {
    addToGeometryObject: addToGeometryObject,
    removeFromGeometryObject: removeFromGeometryObject
  };
}

function utils(node) {
  node.removeAttribute('data-geometry');
}

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

function setPointEvents(leafletObject, id) {
  leafletObject.on('click', function (e) {
    var event = new CustomEvent('geometry:click', {
      detail: {
        clickedPoint: e.latlng,
        geometry: leafletObject.getLatLng(),
        rowId: id
      }
    });
    window.dispatchEvent(event);
  });
}
function setPolyGeometryEvents(leafletObject, id) {
  leafletObject.on('click', function (e) {
    var event = new CustomEvent('geometry:click', {
      detail: {
        clickedPoint: e.latlng,
        geometry: leafletObject.getLatLngs(),
        rowId: id
      }
    });
    window.dispatchEvent(event);
  });
}

var createPointGeometry = function createPointGeometry(parsedGeometry, options) {
  var reverseOrderAll = options.reverseOrderAll,
    reverseOrder = options.reverseOrder;
  var isLonLat = reverseOrderAll || reverseOrder !== undefined;
  var geometry = isLonLat ? [].concat(parsedGeometry).reverse() : parsedGeometry;
  var leafletGeometry = marker(geometry);
  if (options.popup) {
    leafletGeometry.bindPopup(options.popup);
  }
  if (options.tooltip) {
    leafletGeometry.bindTooltip(options.tooltip);
  }
  setPointEvents(leafletGeometry, options.id);
  return leafletGeometry;
};
var createLineGeometry = function createLineGeometry(parsedGeometry, options) {
  var reverseOrderAll = options.reverseOrderAll,
    reverseOrder = options.reverseOrder;
  var isLonLat = reverseOrderAll || reverseOrder !== undefined;
  var geometry = isLonLat ? GeoJSON.coordsToLatLngs(parsedGeometry, 0) : parsedGeometry;
  var leafletGeometry = polyline(geometry);
  if (options.popup) {
    leafletGeometry.bindPopup(options.popup);
  }
  if (options.tooltip) {
    leafletGeometry.bindTooltip(options.tooltip);
  }
  setPolyGeometryEvents(leafletGeometry, options.id);
  return leafletGeometry;
};
var createPolygonGeometry = function createPolygonGeometry(parsedGeometry, options) {
  var reverseOrderAll = options.reverseOrderAll,
    reverseOrder = options.reverseOrder;
  var isLonLat = reverseOrderAll || reverseOrder !== undefined;
  var geometry = isLonLat ? GeoJSON.coordsToLatLngs(parsedGeometry, 1) : parsedGeometry;
  var leafletGeometry = polygon(geometry);
  if (options.popup) {
    leafletGeometry.bindPopup(options.popup);
  }
  if (options.tooltip) {
    leafletGeometry.bindTooltip(options.tooltip);
  }
  setPolyGeometryEvents(leafletGeometry, options.id);
  return leafletGeometry;
};
var createGeometry = function createGeometry(geometryType) {
  return function (parsedGeometry, options) {
    switch (geometryType) {
      case 'Point':
        return createPointGeometry(parsedGeometry, options);
      case 'LineString':
        return createLineGeometry(parsedGeometry, options);
      case 'Polygon':
        return createPolygonGeometry(parsedGeometry, options);
      default:
        // eslint-disable-next-line no-console
        console.warn(geometryType + " is not supported");
        return null;
    }
  };
};
function createLeafletObject(row) {
  var geometry = row.geometry,
    popup = row.popup,
    tooltip = row.tooltip,
    geometryType = row.geometryType,
    id = row.id,
    reverseOrder = row.reverseOrder;
  var parsedGeometry = JSON.parse(geometry);
  var reverseOrderAll = hyperleafletConfig.reverseOrderAll;
  var createGeometryFn = createGeometry(geometryType);
  return createGeometryFn(parsedGeometry, {
    popup: popup,
    tooltip: tooltip,
    id: id,
    reverseOrderAll: reverseOrderAll,
    reverseOrder: reverseOrder
  });
}

function addNodeToHyperleaflet(node, map) {
  var dataset = node.dataset;
  var rowId = dataset.id;
  // eslint-disable-next-line no-underscore-dangle
  var leafletLayers = Object.values(map._layers);
  if (leafletLayers.find(function (layer) {
    return layer.hlID === rowId;
  })) {
    // eslint-disable-next-line no-console
    console.error("%c" + rowId, 'color:red', 'already exists', node);
    return;
  }
  var leafletObject = createLeafletObject(_extends({}, dataset));
  leafletObject.hlID = rowId;
  leafletObject.addTo(map);
}
function deleteNodeFromHyperleaflet(node, map) {
  var rowId = node.dataset.id;

  // eslint-disable-next-line no-underscore-dangle
  var leafletLayers = Object.values(map._layers);
  var leafletObject = leafletLayers.find(function (layer) {
    return layer.hlID === rowId;
  });
  leafletObject == null ? void 0 : leafletObject.remove();
}
function hyperleafletGeometryHandler(map, _ref) {
  var _ref$addCallback = _ref.addCallback,
    addCallback = _ref$addCallback === void 0 ? function () {} : _ref$addCallback,
    _ref$removeCallback = _ref.removeCallback,
    removeCallback = _ref$removeCallback === void 0 ? function () {} : _ref$removeCallback;
  var addNoteListToHyperleaflet = function addNoteListToHyperleaflet(nodes) {
    nodes.forEach(function (node) {
      addNodeToHyperleaflet(node, map);
      addCallback(node);
    });
  };
  function removeNodeListToHyperleaflet(nodes) {
    nodes.forEach(function (node) {
      deleteNodeFromHyperleaflet(node, map);
      removeCallback(node);
    });
  }
  return {
    addNoteListToHyperleaflet: addNoteListToHyperleaflet,
    removeNodeListToHyperleaflet: removeNodeListToHyperleaflet
  };
}
function diffNodesWithMap(mutations, map) {
  var _removeList$filter, _addList$filter;
  // eslint-disable-next-line no-underscore-dangle
  var leafletLayers = Object.values(map._layers);
  var addList = [];
  var removeList = [];
  function getAddedNodes(nodes) {
    nodes.forEach(function (node) {
      if (node.nodeType === 1 && node.matches('[data-id]')) {
        addList.push(node);
      }
      if (node.childNodes.length > 0) {
        getAddedNodes(node.childNodes);
      }
    });
  }
  function getRemovedNodes(nodes) {
    nodes.forEach(function (node) {
      if (node.nodeType === 1 && node.matches('[data-id]')) {
        removeList.push(node);
      }
      if (node.childNodes.length > 0) {
        getRemovedNodes(node.childNodes);
      }
    });
  }
  mutations.forEach(function (mutation) {
    if (mutation.type === 'childList') {
      getAddedNodes(mutation.addedNodes);
      getRemovedNodes(mutation.removedNodes);
    }
  });
  var filteredRemoveList = (_removeList$filter = removeList.filter(function (node) {
    return !addList.some(function (addNode) {
      return addNode.dataset.id === node.dataset.id;
    });
  })) != null ? _removeList$filter : [];
  var filteredAddList = (_addList$filter = addList.filter(function (node) {
    return !leafletLayers.some(function (leafletNode) {
      return leafletNode.hlID === node.dataset.id;
    });
  })) != null ? _addList$filter : [];
  return {
    addedNodes: filteredAddList,
    removedNodes: filteredRemoveList
  };
}

function hyperleafletDataToMap(map) {
  var hyperleafletDataSource = document.querySelector('[data-hyperleaflet-source]');
  if (!hyperleafletDataSource) return;
  var geometryDisplay = hyperleafletDataSource.dataset.geometryDisplay || 'none';
  var callbackFunctions = {};
  if (geometryDisplay === 'json') {
    var _geometryObjectHandle = geometryObjectHandler(),
      addToGeometryObject = _geometryObjectHandle.addToGeometryObject,
      removeFromGeometryObject = _geometryObjectHandle.removeFromGeometryObject;
    callbackFunctions = {
      addCallback: addToGeometryObject,
      removeCallback: removeFromGeometryObject
    };
  } else if (geometryDisplay === 'remove') {
    callbackFunctions = {
      addCallback: utils,
      removeCallback: function removeCallback() {}
    };
  }
  var _hyperleafletGeometry = hyperleafletGeometryHandler(map, callbackFunctions),
    addNoteListToHyperleaflet = _hyperleafletGeometry.addNoteListToHyperleaflet,
    removeNodeListToHyperleaflet = _hyperleafletGeometry.removeNodeListToHyperleaflet;
  map.whenReady(function () {
    var nodes = hyperleafletDataSource.querySelectorAll('[data-id]');
    addNoteListToHyperleaflet(nodes);
  });
  function callback(mutations) {
    var _diffNodesWithMap = diffNodesWithMap(mutations, map),
      addedNodes = _diffNodesWithMap.addedNodes,
      removedNodes = _diffNodesWithMap.removedNodes;
    addNoteListToHyperleaflet(addedNodes);
    removeNodeListToHyperleaflet(removedNodes);
  }
  var observer = new MutationObserver(callback);
  observer.observe(hyperleafletDataSource, {
    childList: true,
    // observe direct children
    subtree: true,
    // and lower descendants too
    attributeFilter: ['data-id']
  });
}

function createMap() {
  var initialized = false;
  function initMap() {
    var mapContainer = document.querySelector('#map');
    if (mapContainer && !initialized) {
      initialized = true;
      var reverseCoords = mapContainer.dataset.reverseCoords;
      if (reverseCoords !== undefined) {
        hyperleafletConfig.reverseCoords = true;
      }
      var map = createHyperleafletMap(mapContainer);
      var tileLayerElementList = mapContainer.querySelectorAll('[data-tile]');
      var _createHyperleafletTi = createHyperleafletTiles(tileLayerElementList),
        defaultHyperleafletTile = _createHyperleafletTi.defaultHyperleafletTile,
        tileController = _createHyperleafletTi.tileController;
      if (tileController) {
        tileController.addTo(map);
      }
      defaultHyperleafletTile.addTo(map);
      hyperleafletDataToMap(map);
      window.hyperleaflet = {
        map: map
      };
      sendHyperleafletReady(map);
    }
  }
  function observeMap() {
    var observer = new MutationObserver(function () {
      var mapElement = document.querySelector('#map');
      if (mapElement) {
        initMap();
      } else if (initialized) {
        initialized = false;
        delete window.hyperleaflet;
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }
  return {
    initMap: initMap,
    observeMap: observeMap
  };
}

var hyperleaflet = function hyperleaflet() {
  var _createMap = createMap(),
    initMap = _createMap.initMap,
    observeMap = _createMap.observeMap;
  document.addEventListener('DOMContentLoaded', function () {
    initMap();
    observeMap();
  });
}();

export { hyperleaflet as default };
//# sourceMappingURL=hyperleaflet.esm.js.map
