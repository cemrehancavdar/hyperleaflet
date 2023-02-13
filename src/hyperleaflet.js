import L from 'leaflet';
import TILE_LAYERS from './constants';
import initEvents from './events';
import createLeafletObject from './leaflet_utils';

const hyperleaflet = (function hyperleaflet() {
  if (typeof L === 'undefined') {
    // eslint-disable-next-line no-console
    console.error('Hyperleaf can not access Leaflet');
    return undefined;
  }

  const hyperleafletContainer = document.querySelector('[hyperleaflet]');

  const debugMode = document.createElement('script');
  debugMode.type = 'application/json';
  debugMode.innerText = `{}`;
  document.body.appendChild(debugMode);
  const debugData = JSON.parse(debugMode.text);

  const mapDiv = document.querySelector('#map');
  const tileLayerDivs = mapDiv.querySelectorAll('[data-tile]');

  const initalMapAttributes = {
    center: [0, 0],
    zoom: 1,
    tile: TILE_LAYERS.OpenStreetMap,
  };

  const { dataset } = mapDiv;

  const center = dataset?.center.split(',') || initalMapAttributes.center.center;
  const zoom = dataset?.zoom || initalMapAttributes.zoom;
  let { tile } = initalMapAttributes;

  const tiles = {};

  tileLayerDivs.forEach((tileLayer) => {
    const { dataset: tileLayerDataset } = tileLayer;
    const tileLayerName = tileLayerDataset.tile;
    if (tileLayerName in TILE_LAYERS) {
      const currentTile = TILE_LAYERS[tileLayerName];
      currentTile.options.minZoom = tileLayerDataset.minZoom;
      currentTile.options.maxZoom = tileLayerDataset.maxZoom;
      tiles[tileLayerName] = currentTile;
      if ('default' in tileLayerDataset) {
        tile = currentTile;
      }
    } else {
      // eslint-disable-next-line no-console
      console.warn(`${tileLayerName} is not in: \n${Object.keys(TILE_LAYERS).join('\n')}`);
    }
  });

  const map = L.map(mapDiv).setView(center, zoom);

  initEvents(map);

  if (Object.keys(tiles).length) {
    L.control.layers(tiles).addTo(map);
  }
  tile.addTo(map);

  const leafletObjects = {};

  const proxy = new Proxy(leafletObjects, {
    set(target, property, value) {
      const geometry = createLeafletObject(value);
      if (geometry) {
        geometry.addTo(map);
        target[property] = geometry;
      } else {
        console.warn(`Geometry with ${property} can not be created`);
      }
      return true;
    },
    deleteProperty(target, property) {
      target[property].remove();
      delete target[property];
      return true;
    },
  });

  function addNodeToHyperleaf(node) {
    const { dataset: data } = node;
    const rowId = data.id;
    proxy[rowId] = { ...data };
    return [rowId, data.geometry];
  }
  function deleteNodeFromHyperleaflet(node) {
    const rowId = node.dataset.id;
    delete proxy[rowId];
    return rowId;
  }
  
  (() => {
    hyperleafletContainer.querySelectorAll('[data-id]').forEach((node) => {
      const [rowId, geometry] = addNodeToHyperleaf(node);
      debugData[rowId] = JSON.parse(geometry);
      debugMode.text = JSON.stringify(debugData, null, 2);
    })
  })();

  function callback(mutations) {

    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.hasAttribute('data-id')) {
            const [rowId, geometry] = addNodeToHyperleaf(node);
            debugData[rowId] = JSON.parse(geometry);
          }
        });
        mutation.removedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.hasAttribute('data-id')) {
            const rowId = deleteNodeFromHyperleaflet(node);
            delete debugData[rowId];
          }
        });
      }
    });
    debugMode.text = JSON.stringify(debugData, null, 2);
  }

  const observer = new MutationObserver(callback);

  observer.observe(hyperleafletContainer, {
    childList: true, // observe direct children
    subtree: true, // and lower descendants too
    attributeFilter: ['data-id'],
  });

  return { map, observer };
})();

export default hyperleaflet;
