import { map, control } from 'leaflet';
import TILE_LAYERS from './constants';
import setMapEvents from './events';

export function getDefaultHyperleafletTile(tileLayerElementList) {
  const defaultTileLayerElement = tileLayerElementList.find((t) => 'defaultTile' in t.dataset);
  if (defaultTileLayerElement) {
    return TILE_LAYERS[defaultTileLayerElement.dataset.tile];
  }
  if (tileLayerElementList.length) {
    return TILE_LAYERS[tileLayerElementList[0].dataset.tile];
  }
  return TILE_LAYERS.OpenStreetMap;
}

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
  const defaultHyperleafletTile = getDefaultHyperleafletTile(tileLayerElementList);
  return {
    defaultHyperleafletTile,
    tileController: hyperleafletTiles.length
      ? control.layers(Object.fromEntries(hyperleafletTiles.map((t) => [t.tile.name, t.tile])))
      : null,
  };
}

export default function createHyperleafletMap(mapElement) {
  const { center, zoom } = mapElement.dataset;

  const mapView = {
    center: center?.split(','),
    zoom: zoom || 1,
  };
  const leafletMap = map(mapElement).setView(mapView.center, mapView.zoom);
  return setMapEvents(leafletMap);
}
