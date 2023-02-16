import L from 'leaflet';
import TILE_LAYERS from './constants';
import initEvents from './events';

const createLeafletMap = () => {
  const mapDiv = document.querySelector('#map');
  const tileLayerDivs = mapDiv.querySelectorAll('[data-tile]');

  const { dataset } = mapDiv;

  const mapAttr = {
    center: dataset?.center.split(',') || [0, 0],
    zoom: dataset?.zoom || 1,
    tile: TILE_LAYERS.OpenStreetMap,
    tiles: {},
  };

  tileLayerDivs.forEach((tileLayer) => {
    const { dataset: tileLayerDataset } = tileLayer;
    const tileLayerName = tileLayerDataset.tile;

    if (tileLayerName in TILE_LAYERS) {
      const currentTile = TILE_LAYERS[tileLayerName];
      currentTile.options.minZoom = tileLayerDataset.minZoom;
      currentTile.options.maxZoom = tileLayerDataset.maxZoom;
      mapAttr.tiles[tileLayerName] = currentTile;

      if ('default' in tileLayerDataset) {
        mapAttr.tile = currentTile;
      }
    } else {
      // eslint-disable-next-line no-console
      console.error(`${tileLayerName} is not in: \n${Object.keys(TILE_LAYERS).join('\n')}`);
    }
  });

  const map = L.map(mapDiv).setView(mapAttr.center, mapAttr.zoom);

  if (Object.keys(mapAttr.tiles).length) {
    L.control.layers(mapAttr.tiles).addTo(map);
  }

  initEvents(map);

  mapAttr.tile.addTo(map);
  return map;
};

export default createLeafletMap;
