import L from 'leaflet';
import HyperleafletGeometryManager from './HyperleafletHandlers';
import createLeafletMap, { createHyperleafletTiles } from './Map';
import { addToDebugObject, deleteFromDebugObject } from './GeometryDOMObject';
import removeGeometryAttributes from './GeometryUtils';

const hyperleaflet = (function hyperleaflet() {
  if (typeof L === 'undefined') {
    // eslint-disable-next-line no-console
    console.error('Hyperleaflet can not access Leaflet');
    return undefined;
  }

  const mapContainer = document.querySelector('#map');
  const map = createLeafletMap(mapContainer);
  const hyperleafletDataContainer = document.querySelector('[hyperleaflet]');

  const tileLayerElementList = mapContainer.querySelectorAll('[data-tile]');
  const { defaultHyperleafletTile, tileController } = createHyperleafletTiles(tileLayerElementList);

  if (tileController) {
    tileController.addTo(map);
  }
  defaultHyperleafletTile.addTo(map);

  const geometryDisplayStrategy = mapContainer.dataset.geometryStrategy || 'remove';

  let callbackFunctions = {};
  if (geometryDisplayStrategy === 'object') {
    callbackFunctions = {
      addCallBack: addToDebugObject,
      removeCallBack: deleteFromDebugObject,
    };
  } else if (geometryDisplayStrategy === 'remove') {
    callbackFunctions = {
      addCallBack: removeGeometryAttributes,
      removeCallBack: () => {},
    };
  }

  const { addNoteListToHyperleaflet, removeNodeListToHyperleaflet } = HyperleafletGeometryManager(
    map,
    callbackFunctions,
  );

  map.whenReady(() => {
    const nodes = hyperleafletDataContainer.querySelectorAll('[data-id]');
    addNoteListToHyperleaflet(nodes);
  });

  function callback(mutations) {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        addNoteListToHyperleaflet(mutation.addedNodes);
        removeNodeListToHyperleaflet(mutation.removedNodes);
      }
    });
  }

  const observer = new MutationObserver(callback);

  observer.observe(hyperleafletDataContainer, {
    childList: true, // observe direct children
    subtree: true, // and lower descendants too
    attributeFilter: ['data-id'],
  });

  const addGeoJsonToMap = (geoJson) => {
    L.geoJSON(geoJson).addTo(map);
  };

  return { map, addGeoJsonToMap };
})();

export default hyperleaflet;
