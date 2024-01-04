import { Hyperleaflet } from './Hyperleaflet';
import { Config } from './config';

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    Hyperleaflet.initialize(document.querySelector(Config.options.mapElement));
  });
})();

window.hyperleaflet = Hyperleaflet;
export { Hyperleaflet as hyperleaflet };
