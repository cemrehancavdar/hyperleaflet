import createMap from './Map';
import hyperleafletConfig from './config';

(function hyperleaflet() {
  const { initMap, observeMap } = createMap();

  document.addEventListener('DOMContentLoaded', () => {
    initMap();
    observeMap();
  });
})();

window.hyperleaflet = hyperleafletConfig;
