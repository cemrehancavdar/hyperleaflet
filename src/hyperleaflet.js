import createMap from './Map';

const hyperleaflet = (function hyperleaflet() {
  const { initMap, observeMap } = createMap();

  document.addEventListener('DOMContentLoaded', () => {
    initMap();
    observeMap();
  });
})();

export default hyperleaflet;
