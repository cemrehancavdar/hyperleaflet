import geometryObjectHandler from './geometry-object-handler';
import removeGeometryAttributes from './utils';
import hyperleafletGeometryHandler from './hyperleaflet-geometry-handler';
import pubsub from '../HtmlTrack/index';

const HYPERLEAFLET_DATA_SOURCE = '[data-hyperleaflet-source]';

function hyperleafletDataToMap(map) {
  const hyperleafletDataSource = document.querySelector(HYPERLEAFLET_DATA_SOURCE);

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

  const { addNoteListToHyperleaflet, removeNodeListFromHyperleaflet } = hyperleafletGeometryHandler(
    map,
    callbackFunctions,
  );

  map.whenReady(() => {
    const nodes = hyperleafletDataSource.querySelectorAll('[data-id]');
    addNoteListToHyperleaflet(nodes);
  });

  pubsub.observe({
    targetSelector: HYPERLEAFLET_DATA_SOURCE,
    uniqueAttribute: 'data-id',
    attributeFilter: ['data-geometry'],
  });

  pubsub.subscribe(HYPERLEAFLET_DATA_SOURCE, 'node_adds', (data) => {
    addNoteListToHyperleaflet(data);
  });
  pubsub.subscribe(HYPERLEAFLET_DATA_SOURCE, 'node_removes', (data) => {
    removeNodeListFromHyperleaflet(data);
  });
}

export default hyperleafletDataToMap;
