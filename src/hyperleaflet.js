import createMap from './Map';
import { getGlobalObject} from "./utils";
import {defaultHyperlaefletObject} from './config';

const hyperleaflet = (function hyperleaflet() {
  const { initMap, observeMap } = createMap();

  document.addEventListener('DOMContentLoaded', () => {
    initMap();
    observeMap();
  });
})();
getGlobalObject().hl = "defaultHyperlaefletObject"

getGlobalObject().hyperleafletCfg = defaultHyperlaefletObject

export default hyperleaflet;
