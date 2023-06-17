import { map } from 'leaflet';
import TILE_LAYERS from './tiles';
import setMapEvents from './events';
import { createTileController, parseTileLayerElement, safeParsePoint } from './util';
import hyperleafletConfig from '../config';

export function getDefaultHyperleafletTile(tileLayerElementList) {
  const defaultTileLayerElement = tileLayerElementList.find((t) => 'defaultTile' in t.dataset);
  if (defaultTileLayerElement && defaultTileLayerElement.dataset.tile in TILE_LAYERS) {
    return TILE_LAYERS[defaultTileLayerElement.dataset.tile];
  }
  if (tileLayerElementList.length && tileLayerElementList[0].dataset.tile in TILE_LAYERS) {
    return TILE_LAYERS[tileLayerElementList[0].dataset.tile];
  }
  return TILE_LAYERS.OpenStreetMap;
}

export function createHyperleafletTiles(tileLayerElementNodeList) {
  const tileLayerElementList = Array.from(tileLayerElementNodeList);
  const hyperleafletTiles = tileLayerElementList.map(parseTileLayerElement).filter(Boolean);
  const defaultHyperleafletTile = getDefaultHyperleafletTile(tileLayerElementList);
  const tileController = createTileController(hyperleafletTiles);
  return {
    defaultHyperleafletTile,
    tileController,
  };
}

export default function createHyperleafletMap(mapElement) {
  const { center, zoom, minZoom, maxZoom } = mapElement.dataset;
  const { reverseOrderAll } = hyperleafletConfig;
  const mapView = {
    center: safeParsePoint(center, reverseOrderAll),
    zoom: zoom || 1,
  };
  const leafletMap = map(mapElement, {
    center: mapView.center,
    zoom: mapView.zoom,
    minZoom: minZoom || 0,
    maxZoom: maxZoom || 18,
  });
  return setMapEvents(leafletMap);
}
