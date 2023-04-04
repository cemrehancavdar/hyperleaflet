import { control, TileLayer } from 'leaflet';
import tileLayers, { addTileLayer } from './tiles';

export function createCustomTileLayer(url, { minZoom, maxZoom, tms } = {}) {
  return new TileLayer(url, { minZoom: minZoom || 0, maxZoom: maxZoom || 18, tms: !!tms });
}

export function createTileController(tiles) {
  return tiles.length ? control.layers(Object.fromEntries(tiles.map(({ name, tile }) => [name, tile]))) : null;
}

export function parseTileLayerElement(tileLayerElement) {
  const { tile, tileUrl, tms, minZoom, maxZoom } = tileLayerElement.dataset;
  if (tileUrl) {
    const newTile = createCustomTileLayer(tileUrl, { minZoom, maxZoom, tms: tms === 'true' });
    addTileLayer({ name: tile, tile: newTile });
  }
  const currentTile = tileLayers[tile];
  if (!currentTile) {
    console.warn(`${tile} is not in: \n${Object.keys(tileLayers).join('\n')}`);
    return null;
  }
  currentTile.options.minZoom = minZoom;
  currentTile.options.maxZoom = maxZoom;
  return { tile: currentTile, name: tile };
}
