import createHyperleafletMap, { createHyperleafletTiles } from './map-utils';

/**
 *Creates a map
 * @returns {L.Map}
 */
function createMap() {
  const mapContainer = document.querySelector('#map');
  const map = createHyperleafletMap(mapContainer);

  const tileLayerElementList = mapContainer.querySelectorAll('[data-tile]');
  const { defaultHyperleafletTile, tileController } = createHyperleafletTiles(tileLayerElementList);

  if (tileController) {
    tileController.addTo(map);
  }
  defaultHyperleafletTile.addTo(map);
  return map;
}

export default createMap;
