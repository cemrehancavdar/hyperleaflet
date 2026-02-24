import { Hyperleaflet } from './Hyperleaflet';
import { Config } from './config';

function initializeMap() {
  const mapContainer = document.querySelector(Config.options.mapElement);
  if (mapContainer) {
    Hyperleaflet.initialize(mapContainer);
    return true;
  }
  return false;
}

function observeMap() {
  const observer = new MutationObserver((_mutations, obs) => {
    if (initializeMap()) {
      obs.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    if (!initializeMap()) {
      observeMap();
    }
  });
})();

window.hyperleaflet = Hyperleaflet;
export { Hyperleaflet as hyperleaflet };
