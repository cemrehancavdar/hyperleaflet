import { marker, GeoJSON, polyline, polygon, tileLayer, map, control, geoJSON } from 'leaflet';

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
  var point = marker(parsedGeometry);
  if (options.popup) {
    point.bindPopup(options.popup);
  }
  if (options.tooltip) {
    point.bindTooltip(options.tooltip);
  }
  setGeometryEvents(point, options.id);
  return point;
};
var createLineGeometry = function createLineGeometry(parsedGeometry, options) {
  var flippedGeometry = GeoJSON.coordsToLatLngs(parsedGeometry, 1);
  var line = polyline(flippedGeometry);
  if (options.popup) {
    line.bindPopup(options.popup);
  }
  if (options.tooltip) {
    line.bindTooltip(options.tooltip);
  }
  setGeometryEvents(line, options.id);
  return line;
};
var createPolygonGeometry = function createPolygonGeometry(parsedGeometry, options) {
  var flippedGeometry = GeoJSON.coordsToLatLngs(parsedGeometry, 1);
  var _polygon = polygon(flippedGeometry);
  if (options.popup) {
    _polygon.bindPopup(options.popup);
  }
  if (options.tooltip) {
    _polygon.bindTooltip(options.tooltip);
  }
  setGeometryEvents(_polygon, options.id);
  return _polygon;
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

var TILE_LAYERS = {
  OpenStreetMap: tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }),
  EsriWorldImagery: tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  })
};

function getDefaultHyperleafletTile(tileLayerElementList) {
  var defaultTileLayerElement = tileLayerElementList.find(function (t) {
    return 'defaultTile' in t.dataset;
  });
  if (defaultTileLayerElement) {
    return TILE_LAYERS[defaultTileLayerElement.dataset.tile];
  }
  if (tileLayerElementList.length) {
    return TILE_LAYERS[tileLayerElementList[0].dataset.tile];
  }
  return TILE_LAYERS.OpenStreetMap;
}
function createHyperleafletTiles(tileLayerElementNodeList) {
  var tileLayerElementList = Array.from(tileLayerElementNodeList);
  var hyperleafletTiles = tileLayerElementList.map(function (tileLayerElement) {
    var _tileLayerElement$dat = tileLayerElement.dataset,
      tile = _tileLayerElement$dat.tile,
      minZoom = _tileLayerElement$dat.minZoom,
      maxZoom = _tileLayerElement$dat.maxZoom;
    var currentTile = TILE_LAYERS[tile];
    if (!currentTile) {
      // eslint-disable-next-line no-console
      console.warn(tile + " is not in: \n" + Object.keys(TILE_LAYERS).join('\n'));
      return null;
    }
    currentTile.options.minZoom = minZoom;
    currentTile.options.maxZoom = maxZoom;
    currentTile.name = tile;
    return {
      tile: currentTile
    };
  }).filter(Boolean);
  var defaultHyperleafletTile = getDefaultHyperleafletTile(tileLayerElementList);
  return {
    defaultHyperleafletTile: defaultHyperleafletTile,
    tileController: hyperleafletTiles.length ? control.layers(Object.fromEntries(hyperleafletTiles.map(function (t) {
      return [t.tile.name, t.tile];
    }))) : null
  };
}
function createHyperleafletMap(mapElement) {
  var _mapElement$dataset = mapElement.dataset,
    center = _mapElement$dataset.center,
    zoom = _mapElement$dataset.zoom;
  var mapView = {
    center: center == null ? void 0 : center.split(','),
    zoom: zoom || 1
  };
  var map_ = map(mapElement).setView(mapView.center, mapView.zoom);
  return setMapEvents(map_);
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

function removeGeometryAttribute(node) {
  node.removeAttribute('data-geometry');
}

var hyperleaflet = function hyperleaflet() {
  // if (typeof L === 'undefined') {
  //   // eslint-disable-next-line no-console
  //   console.error('Hyperleaflet can not access Leaflet');
  //   return undefined;
  // }

  var mapContainer = document.querySelector('#map');
  var map = createHyperleafletMap(mapContainer);
  var hyperleafletDataContainer = document.querySelector('[hyperleaflet]');
  var tileLayerElementList = mapContainer.querySelectorAll('[data-tile]');
  var _createHyperleafletTi = createHyperleafletTiles(tileLayerElementList),
    defaultHyperleafletTile = _createHyperleafletTi.defaultHyperleafletTile,
    tileController = _createHyperleafletTi.tileController;
  if (tileController) {
    tileController.addTo(map);
  }
  defaultHyperleafletTile.addTo(map);
  var geometryDisplayStrategy = hyperleafletDataContainer.dataset.geometryDisplay || 'object';
  var callbackFunctions = {};
  if (geometryDisplayStrategy === 'object') {
    callbackFunctions = {
      addCallback: addToDebug,
      removeCallback: deleteFromDebug
    };
  } else if (geometryDisplayStrategy === 'remove') {
    callbackFunctions = {
      addCallback: removeGeometryAttribute,
      removeCallback: function removeCallback() {}
    };
  }
  var _hyperleafletGeometry = hyperleafletGeometryHandler(map, callbackFunctions),
    addNoteListToHyperleaflet = _hyperleafletGeometry.addNoteListToHyperleaflet,
    removeNodeListToHyperleaflet = _hyperleafletGeometry.removeNodeListToHyperleaflet;
  map.whenReady(function () {
    var nodes = hyperleafletDataContainer.querySelectorAll('[data-id]');
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
  observer.observe(hyperleafletDataContainer, {
    childList: true,
    // observe direct children
    subtree: true,
    // and lower descendants too
    attributeFilter: ['data-id']
  });
  var addGeoJsonToMap = function addGeoJsonToMap(geoJson) {
    geoJSON(geoJson).addTo(map);
  };
  return {
    map: map,
    addGeoJsonToMap: addGeoJsonToMap
  };
}();

export { hyperleaflet as default };
//# sourceMappingURL=hyperleaflet.module.js.map
