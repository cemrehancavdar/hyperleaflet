import { addToDebug, deleteFromDebug } from './geometry-debugger';
import removeGeometryAttributes from './utils';
import hyperleafletGeometryHandler from './hyperleaflet-geometry-handler';

/**
 * Adds the data from the hyperleaflet container to the map.
 @param {L.Map} map
 @param map
 */

function hyperleafletDataToMap(map) {
  const hyperleafletDataContainer = document.querySelector('[hyperleaflet]');

  if (!hyperleafletDataContainer) return;

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
}

export default hyperleafletDataToMap;
