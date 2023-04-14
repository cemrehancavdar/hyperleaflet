import { tileLayer, control, TileLayer, map, marker, GeoJSON, polyline, polygon, geoJSON } from 'leaflet';

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

function setMapEvents(map) {
  map.on('click', function (e) {
    var event = new CustomEvent('mapclick', {
      detail: {
        point: e.latlng
      }
    });
    window.dispatchEvent(event);
  });
  map.on('zoomend', function () {
    var event = new CustomEvent('mapzoom', {
      detail: {
        zoom: map.getZoom(),
        center: map.getCenter(),
        bbox: map.getBounds()
      }
    });
    window.dispatchEvent(event);
  });
  map.on('move', function () {
    var event = new CustomEvent('mapmove', {
      detail: {
        zoom: map.getZoom(),
        center: map.getCenter(),
        bbox: map.getBounds()
      }
    });
    window.dispatchEvent(event);
  });
  return map;
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
  var _center$split;
  var _mapElement$dataset = mapElement.dataset,
    center = _mapElement$dataset.center,
    zoom = _mapElement$dataset.zoom,
    minZoom = _mapElement$dataset.minZoom,
    maxZoom = _mapElement$dataset.maxZoom;
  var mapView = {
    center: (_center$split = center == null ? void 0 : center.split(',')) != null ? _center$split : [0, 0],
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

/**
 *Creates a map
 * @returns {L.Map}
 */
function createMap() {
  var mapContainer = document.querySelector('#map');
  var map = createHyperleafletMap(mapContainer);
  var tileLayerElementList = mapContainer.querySelectorAll('[data-tile]');
  var _createHyperleafletTi = createHyperleafletTiles(tileLayerElementList),
    defaultHyperleafletTile = _createHyperleafletTi.defaultHyperleafletTile,
    tileController = _createHyperleafletTi.tileController;
  if (tileController) {
    tileController.addTo(map);
  }
  defaultHyperleafletTile.addTo(map);
  return map;
}

var debugMode = document.createElement('script');
debugMode.type = 'application/json';
debugMode.setAttribute('data-testid', 'debug');
debugMode.innerText = '{}';
document.body.appendChild(debugMode);
var debugObject = JSON.parse(debugMode.text);
function addToDebug(node) {
  var _node$dataset = node.dataset,
    id = _node$dataset.id,
    geometry = _node$dataset.geometry,
    geometryType = _node$dataset.geometryType;
  node.removeAttribute('data-geometry');
  debugObject[id] = {
    type: geometryType,
    coordinates: JSON.parse(geometry)
  };
  debugMode.text = JSON.stringify(debugObject, null, 2);
}
function deleteFromDebug(node) {
  var id = node.dataset.id;
  delete debugObject[id];
  debugMode.text = JSON.stringify(debugObject, null, 2);
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

function setGeometryEvents(leafletObject, id) {
  leafletObject.on('click', function () {
    var event = new CustomEvent('pointclick', {
      detail: {
        point: leafletObject.getLatLng(),
        rowId: id
      }
    });
    window.dispatchEvent(event);
  });
}

var createPointGeometry = function createPointGeometry(parsedGeometry, options) {
  var geometry = marker(parsedGeometry);
  if (options.popup) {
    geometry.bindPopup(options.popup);
  }
  if (options.tooltip) {
    geometry.bindTooltip(options.tooltip);
  }
  setGeometryEvents(geometry, options.id);
  return geometry;
};
var createLineGeometry = function createLineGeometry(parsedGeometry, options) {
  var flippedGeometry = GeoJSON.coordsToLatLngs(parsedGeometry, 0);
  var geometry = polyline(flippedGeometry);
  if (options.popup) {
    geometry.bindPopup(options.popup);
  }
  if (options.tooltip) {
    geometry.bindTooltip(options.tooltip);
  }
  setGeometryEvents(geometry, options.id);
  return geometry;
};
var createPolygonGeometry = function createPolygonGeometry(parsedGeometry, options) {
  var flippedGeometry = GeoJSON.coordsToLatLngs(parsedGeometry, 1);
  var geometry = polygon(flippedGeometry);
  if (options.popup) {
    geometry.bindPopup(options.popup);
  }
  if (options.tooltip) {
    geometry.bindTooltip(options.tooltip);
  }
  setGeometryEvents(geometry, options.id);
  return geometry;
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
    id = row.id;
  var parsedGeometry = JSON.parse(geometry);
  var createGeometryFn = createGeometry(geometryType);
  return createGeometryFn(parsedGeometry, {
    popup: popup,
    tooltip: tooltip,
    id: id
  });
}

var leafletObjectMap = new Map();
function addNodeToHyperleaflet(node) {
  var dataset = node.dataset;
  var rowId = dataset.id;
  if (rowId in leafletObjectMap) {
    // eslint-disable-next-line no-console
    console.error("%c" + rowId, 'color:red', 'already exists', node);
    return [];
  }
  var leafletObject = createLeafletObject(_extends({}, dataset));
  leafletObjectMap.set(rowId, leafletObject);
  return [leafletObject];
}
function deleteNodeFromHyperleaflet(node) {
  var rowId = node.dataset.id;
  var leafletObject = leafletObjectMap.get(rowId);
  leafletObjectMap["delete"](rowId);
  return [leafletObject];
}
function hyperleafletGeometryHandler(map, _ref) {
  var _ref$addCallback = _ref.addCallback,
    addCallback = _ref$addCallback === void 0 ? function () {} : _ref$addCallback,
    _ref$removeCallback = _ref.removeCallback,
    removeCallback = _ref$removeCallback === void 0 ? function () {} : _ref$removeCallback;
  var addNoteListToHyperleaflet = function addNoteListToHyperleaflet(nodes) {
    nodes.forEach(function (node) {
      if (node.nodeType === 1 && node.matches('[data-id]')) {
        var _addNodeToHyperleafle = addNodeToHyperleaflet(node),
          leafletObject = _addNodeToHyperleafle[0];
        leafletObject.addTo(map);
        addCallback(node);
      }
    });
  };
  function removeNodeListToHyperleaflet(nodes) {
    nodes.forEach(function (node) {
      if (node.nodeType === 1 && node.matches('[data-id]')) {
        var _deleteNodeFromHyperl = deleteNodeFromHyperleaflet(node),
          leafletObject = _deleteNodeFromHyperl[0];
        leafletObject.remove();
        removeCallback(node);
      }
    });
  }
  return {
    addNoteListToHyperleaflet: addNoteListToHyperleaflet,
    removeNodeListToHyperleaflet: removeNodeListToHyperleaflet
  };
}

/**
 * Adds the data from the hyperleaflet container to the map.
 @param {L.Map} map
 @param map
 */

function hyperleafletDataToMap(map) {
  var hyperleafletDataSource = document.querySelector('[data-hyperleaflet-source]');
  if (!hyperleafletDataSource) return;
  var geometryDisplayStrategy = hyperleafletDataSource.dataset.geometryDisplay || 'object';
  var callbackFunctions = {};
  if (geometryDisplayStrategy === 'object') {
    callbackFunctions = {
      addCallback: addToDebug,
      removeCallback: deleteFromDebug
    };
  } else if (geometryDisplayStrategy === 'remove') {
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
    mutations.forEach(function (mutation) {
      if (mutation.type === 'childList') {
        addNoteListToHyperleaflet(mutation.addedNodes);
        removeNodeListToHyperleaflet(mutation.removedNodes);
      }
    });
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

var hyperleaflet = function hyperleaflet() {
  var map = createMap();
  hyperleafletDataToMap(map);

  // TODO - move this to a separate file
  /**
   Adds a GeoJSON object to the map.
   @param {Object} geoJSON - The GeoJSON object to add to the map.
   @returns {void}
   */
  var addGeoJsonToMap = function addGeoJsonToMap(geoJSON$1) {
    geoJSON(geoJSON$1).addTo(map);
  };
  return {
    map: map,
    addGeoJsonToMap: addGeoJsonToMap
  };
}();

export { hyperleaflet as default };
//# sourceMappingURL=hyperleaflet.module.js.map
