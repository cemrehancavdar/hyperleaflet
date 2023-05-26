import geometryObjectHandler from './geometry-object-handler';
import removeGeometryAttributes from './utils';
import hyperleafletGeometryHandler from './hyperleaflet-geometry-handler';

function hyperleafletDataToMap(map) {
  const hyperleafletDataSource = document.querySelector('[data-hyperleaflet-source]');

  if (!hyperleafletDataSource) return;

  const geometryDisplay = hyperleafletDataSource.dataset.geometryDisplay || 'none';

  let callbackFunctions = {};
  if (geometryDisplay === 'json') {
    const { addToGeometryObject, removeFromGeometryObject } = geometryObjectHandler();
    callbackFunctions = {
      addCallback: addToGeometryObject,
      removeCallback: removeFromGeometryObject,
    };
  } else if (geometryDisplay === 'remove') {
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
    const nodes = hyperleafletDataSource.querySelectorAll('[data-id]');
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

  observer.observe(hyperleafletDataSource, {
    childList: true, // observe direct children
    subtree: true, // and lower descendants too
    attributeFilter: ['data-id'],
  });
}

export default hyperleafletDataToMap;
