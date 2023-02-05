import L from 'leaflet';
import { defineExtension } from 'htmx.org';
import TILE_LAYERS from './constants';

const hyperleaflet = (function hyperleaflet() {
  if (typeof L === 'undefined') {
    // eslint-disable-next-line no-console
    console.error('Hyperleaf can not access Leaflet');
    return undefined;
  }

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

  if (Object.keys(tiles).length) {
    L.control.layers(tiles).addTo(map);
  }
  tile.addTo(map);

  const leafletObjects = {};

  const proxy = new Proxy(leafletObjects, {
    set(target, property, value) {
      const point = L.marker(value.split(',')).addTo(map);
      target[property] = point;
      return true;
    },
    deleteProperty(target, property) {
      target[property].remove();
      delete target[property];
      return true;
    },
  });

  const getDifference = (original, current) => {
    const originalList = Object.keys(original);
    const newsList = Object.keys(current);

    const adds = newsList.filter((item) => !originalList.includes(item));
    const deletes = originalList.filter((item) => !newsList.includes(item));

    return { adds, deletes };
  };

  const processHyperleafTable = (target) => {
    const rowNodeList = target.querySelectorAll('[data-id]');
    const rowList = Array.from(rowNodeList);
    const currentObjects = rowList.reduce((curr, next) => ({ ...curr, [next.dataset.id]: next.dataset.latlng }), {});
    const difference = getDifference(leafletObjects, currentObjects);

    difference.adds.forEach((row) => {
      proxy[row] = currentObjects[row];
    });
    difference.deletes.forEach((row) => {
      delete proxy[row];
    });
  };

  defineExtension('leaflet', {
    onEvent: (name) => {
      if (['htmx:afterProcessNode', 'htmx:afterOnLoad'].includes(name)) {
        const hyperleafTable = document.querySelector('[hx-ext=leaflet]');
        processHyperleafTable(hyperleafTable);
      }
    },
  });

  return { map };
})();

export default hyperleaflet;
