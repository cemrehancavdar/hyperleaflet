import L from 'leaflet';
import createLeafletObject from './geometry';
import createLeafletMap from './map';

const hyperleaflet = (function hyperleaflet() {
  if (typeof L === 'undefined') {
    // eslint-disable-next-line no-console
    console.error('Hyperleaf can not access Leaflet');
    return undefined;
  }

  const map = createLeafletMap();
  const hyperleafletContainer = document.querySelector('[hyperleaflet]');

  const debugMode = document.createElement('script');
  debugMode.type = 'application/json';
  debugMode.innerText = `{}`;
  document.body.appendChild(debugMode);
  const debugData = JSON.parse(debugMode.text);

  const leafletObjects = {};

  const proxy = new Proxy(leafletObjects, {
    set(target, id, row) {
      if (id in target) {
        // eslint-disable-next-line no-console
        console.error(`${id} already exists`);
        return false;
      }

      const leafletObject = createLeafletObject(row);

      if (leafletObject) {
        leafletObject.addTo(map);
        target[id] = leafletObject;
      } else {
        // eslint-disable-next-line no-console
        console.warn(`Geometry with ${id} can not be created`);
      }
      return true;
    },
    deleteProperty(target, id) {
      target[id].remove();
      delete target[id];
      return true;
    },
  });

  function addNodeToHyperleaf(node) {
    const { dataset: data } = node;
    const rowId = data.id;
    proxy[rowId] = { ...data };
    return [rowId, data.geometry, data.geometryType];
  }
  function deleteNodeFromHyperleaflet(node) {
    const rowId = node.dataset.id;
    delete proxy[rowId];
    return rowId;
  }

  (() => {
    hyperleafletContainer.querySelectorAll('[data-id]').forEach((node) => {
      const [rowId, geometry, geometryType] = addNodeToHyperleaf(node);
      if (rowId) {
        debugData[rowId] = { type: geometryType, coordinates: JSON.parse(geometry) };
        node.removeAttribute('data-geometry');
      }
      debugMode.text = JSON.stringify(debugData, null, 2);
    });
  })();

  function callback(mutations) {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.hasAttribute('data-id')) {
            const [rowId, geometry, geometryType] = addNodeToHyperleaf(node);
            if (rowId) {
              debugData[rowId] = { type: geometryType, coordinates: JSON.parse(geometry) };
              node.removeAttribute('data-geometry');
            }
          }
        });
        mutation.removedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.hasAttribute('data-id')) {
            const rowId = deleteNodeFromHyperleaflet(node);
            delete debugData[rowId];
          }
        });
      }
    });
    debugMode.text = JSON.stringify(debugData, null, 2);
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
