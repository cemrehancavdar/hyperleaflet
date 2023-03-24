import { geoJSON } from 'leaflet';
import hyperleafletGeometryHandler from './hyperleaflet-geometry-handler';
import createHyperleafletMap, { createHyperleafletTiles } from './map-utils';
import { addToDebug, deleteFromDebug } from './geometry-debugger';
import removeGeometryAttributes from './remove-geometry-attribute';

const hyperleaflet = (function hyperleaflet() {
  // TODO: This is a temporary fix for the issue that the Leaflet library is not loaded
  // if (typeof L === 'undefined') {
  //   // eslint-disable-next-line no-console
  //   console.error('Hyperleaflet can not access Leaflet');
  //   return undefined;
  // }

  const mapContainer = document.querySelector('#map');
  const map = createHyperleafletMap(mapContainer);
  const hyperleafletDataContainer = document.querySelector('[hyperleaflet]');

  const tileLayerElementList = mapContainer.querySelectorAll('[data-tile]');
  const { defaultHyperleafletTile, tileController } = createHyperleafletTiles(tileLayerElementList);

  if (tileController) {
    tileController.addTo(map);
  }
  defaultHyperleafletTile.addTo(map);

  const geometryDisplayStrategy = hyperleafletDataContainer.dataset.geometryDisplay || 'object';

  let callbackFunctions = {};
  if (geometryDisplayStrategy === 'object') {
    callbackFunctions = {
      addCallback: addToDebug,
      removeCallback: deleteFromDebug,
    };
  } else if (geometryDisplayStrategy === 'remove') {
    callbackFunctions = {
      addCallback: removeGeometryAttributes,
      removeCallback: () => {},
    };
  }

  const { addNoteListToHyperleaflet, removeNodeListToHyperleaflet } = hyperleafletGeometryHandler(
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
    geoJSON(geoJson).addTo(map);
  };

  return { map, addGeoJsonToMap };
})();

export default hyperleaflet;
