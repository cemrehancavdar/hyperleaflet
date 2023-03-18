import L from 'leaflet';
import TILE_LAYERS from './constants';
import setMapEvents from './events';

export function createHyperleafletTiles(tileLayerElementNodeList) {
  const tileLayerElementList = Array.from(tileLayerElementNodeList);
  const hyperleafletTiles = tileLayerElementList
    .map((tileLayerElement) => {
      const { tile, minZoom, maxZoom } = tileLayerElement.dataset;

      const currentTile = TILE_LAYERS[tile];
      if (!currentTile) {
        // eslint-disable-next-line no-console
        console.warn(`${tile} is not in: \n${Object.keys(TILE_LAYERS).join('\n')}`);
        return null;
      }
      currentTile.options.minZoom = minZoom;
      currentTile.options.maxZoom = maxZoom;
      currentTile.name = tile;
      return { tile: currentTile };
    })
    .filter(Boolean);
  const defaultHyperleafletTileName = tileLayerElementList.find((t) => 'defaultTile' in t.dataset)?.dataset.tile;
  const defaultHyperleafletTile = TILE_LAYERS[defaultHyperleafletTileName];
  return {
    defaultHyperleafletTile: defaultHyperleafletTile ?? TILE_LAYERS.OpenStreetMap,
    tileController: hyperleafletTiles.length
      ? L.control.layers(Object.fromEntries(hyperleafletTiles.map((t) => [t.tile.name, t.tile])))
      : null,
  };
}

export default function createHyperleafletMap(mapElement) {
  const { center, zoom } = mapElement.dataset;

  const mapView = {
    center: center?.split(','),
    zoom: zoom || 1,
  };
  const map = L.map(mapElement).setView(mapView.center, mapView.zoom);
  return setMapEvents(map);
}
