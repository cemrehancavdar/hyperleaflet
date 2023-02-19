import L from 'leaflet';
import LeafletWrapper from './HyperleafletHandlers';
import createLeafletMap from './Map';

const hyperleaflet = (function hyperleaflet() {
  if (typeof L === 'undefined') {
    // eslint-disable-next-line no-console
    console.error('Hyperleaf can not access Leaflet');
    return undefined;
  }

  const map = createLeafletMap('#map');
  const hyperleafletContainer = document.querySelector('[hyperleaflet]');
  const geometryStrategy = 'inline';

  const { hyperleafletInteraction } = LeafletWrapper(map);
  const { addNoteListToHyperleaflet, removeNodeListToHyperleaflet } = hyperleafletInteraction(geometryStrategy);

  // TODO implement strategy

  map.whenReady(() => {
    const nodes = hyperleafletContainer.querySelectorAll('[data-id]');
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

  observer.observe(hyperleafletContainer, {
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
