import L from 'leaflet';
import GeometryStrategy from './geometryStrategy';
import LeafletWrapper from './hyperleafletHandlers';
import createLeafletMap from './map';

const hyperleaflet = (function hyperleaflet() {
  if (typeof L === 'undefined') {
    // eslint-disable-next-line no-console
    console.error('Hyperleaf can not access Leaflet');
    return undefined;
  }

  const map = createLeafletMap();
  const hyperleafletContainer = document.querySelector('[hyperleaflet]');

  const { addNodeToHyperleaf, deleteNodeFromHyperleaflet } = LeafletWrapper(map);
  const { addToDebugObject, deleteFromDebugObject, saveDebugObject } = GeometryStrategy();

  // TODO implement strategy

  map.whenReady(() => {
    hyperleafletContainer.querySelectorAll('[data-id]').forEach((node) => {
      const [rowId, geometry, geometryType] = addNodeToHyperleaf(node);
      if (rowId) {
        addToDebugObject(rowId, geometry, geometryType);
      }
      saveDebugObject();
    });
  });

  function callback(mutations) {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.hasAttribute('data-id')) {
            const [rowId, geometry, geometryType] = addNodeToHyperleaf(node);
            if (rowId) {
              addToDebugObject(rowId, geometry, geometryType);
            }
          }
        });
        mutation.removedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.hasAttribute('data-id')) {
            const rowId = deleteNodeFromHyperleaflet(node);
            deleteFromDebugObject(rowId);
          }
        });
      }
    });
    saveDebugObject();
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
