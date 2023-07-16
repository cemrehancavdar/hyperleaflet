import createHyperleafletMap, { createHyperleafletTiles } from './map';
import hyperleafletDataToMap from '../Geometry/index';
import { sendHyperleafletReady } from './events';
import hyperleafletConfig from '../config';

function createMap() {
  let initialized = false;
  function initMap() {
    const mapContainer = document.querySelector('#map');
    if (mapContainer && !initialized) {
      initialized = true;
      const { reverseCoordinateOrder } = mapContainer.dataset;
      if (reverseCoordinateOrder !== undefined) {
        hyperleafletConfig.reverseOrreverseCoordinateOrderderAll = true;
      }

      const map = createHyperleafletMap(mapContainer);

      const tileLayerElementList = mapContainer.querySelectorAll('[data-tile]');
      const { defaultHyperleafletTile, tileController } = createHyperleafletTiles(tileLayerElementList);

      if (tileController) {
        tileController.addTo(map);
      }
      defaultHyperleafletTile.addTo(map);
      hyperleafletDataToMap(map);
      hyperleafletConfig.map = map
      sendHyperleafletReady(map);
    }
  }

  function observeMap() {
    const observer = new MutationObserver(() => {
      const mapElement = document.querySelector('#map');
      if (mapElement) {
        initMap();
      } else if (initialized) {
        initialized = false;
        delete window.hyperleaflet;
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  return { initMap, observeMap };
}
export default createMap;
