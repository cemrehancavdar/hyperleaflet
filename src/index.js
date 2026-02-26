/**
 * Hyperleaflet entry point.
 *
 * Auto-initializes on DOMContentLoaded. If #map isn't in the DOM yet
 * (SPA routing), watches for it with a body MutationObserver.
 */

import { Hyperleaflet } from './hyperleaflet';

function initializeMap() {
  const container = document.querySelector(Hyperleaflet.config.options.mapElement);
  if (container) {
    Hyperleaflet.initialize(container);
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
