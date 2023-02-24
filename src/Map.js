import L from 'leaflet';
import TILE_LAYERS from './Constants';
import initializeMapEvents from './Events';

export function createHyperleafletTiles(tileLayerElementList) {
  const hyperleafletTiles = new Map();
  const hyperleafletTileManager = { defaultHyperleafletTile: TILE_LAYERS.OpenStreetMap, tileController: null };

  tileLayerElementList.forEach((tileLayerElement) => {
    const { tile, defaultTile, minZoom, maxZoom } = tileLayerElement.dataset;

    if (tile in TILE_LAYERS) {
      const currentTile = TILE_LAYERS[tile];
      currentTile.options.minZoom = minZoom;
      currentTile.options.maxZoom = maxZoom;
      hyperleafletTiles.set(tile, currentTile);

      if (defaultTile) {
        hyperleafletTileManager.defaultHyperleafletTile = currentTile;
      }
    } else {
      // eslint-disable-next-line no-console
      console.warn(`${tile} is not in: \n${Object.keys(TILE_LAYERS).join('\n')}`);
    }
  });

  if (hyperleafletTiles.size) {
    hyperleafletTileManager.tileController = L.control.layers(Object.fromEntries(hyperleafletTiles));
  }
  return { ...hyperleafletTileManager };
}

export default function createLeafletMap(mapContainer) {
  const { center, zoom } = mapContainer.dataset;

  const view = {
    center: center?.split(','),
    zoom: zoom || 1,
  };

  const map = L.map(mapContainer).setView(view.center, view.zoom);

  initializeMapEvents(map);

  return map;
}
