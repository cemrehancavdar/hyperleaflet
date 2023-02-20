import L from 'leaflet';
import TILE_LAYERS from './Constants';
import initEvents from './Events';

function createHyperleafletTiles(tileLayerElementList) {
  const hyperleafletTiles = new Map();
  let defautHyperleafletTile = TILE_LAYERS.OpenStreetMap;

  tileLayerElementList.forEach((element) => {
    const { tile, minZoom, maxZoom, defautTile } = element.dataset;

    if (tile in TILE_LAYERS) {
      const currentTile = TILE_LAYERS[tile];
      currentTile.options.minZoom = minZoom;
      currentTile.options.maxZoom = maxZoom;
      hyperleafletTiles.set(tile, currentTile);

      if (defautTile) {
        defautHyperleafletTile = currentTile;
      }
    } else {
      // eslint-disable-next-line no-console
      console.error(`${tile} is not in: \n${Object.keys(TILE_LAYERS).join('\n')}`);
    }
  });
  return { hyperleafletTiles, defautHyperleafletTile };
}

const createLeafletMap = (mapSelector) => {
  const mapContainer = document.querySelector(mapSelector);
  const tileLayerElementList = mapContainer.querySelectorAll('[data-tile]');

  const { center, zoom } = mapContainer.dataset;

  const { hyperleafletTiles, defautHyperleafletTile } = createHyperleafletTiles(tileLayerElementList);

  const view = {
    center: center?.split(','),
    zoom: zoom || 1,
  };

  const map = L.map(mapContainer).setView(view.center, view.zoom);

  if (hyperleafletTiles.size) {
    L.control.layers(Object.fromEntries(hyperleafletTiles)).addTo(map);
  }

  initEvents(map);

  defautHyperleafletTile.addTo(map);
  return map;
};

export default createLeafletMap;
