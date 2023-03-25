import { geoJSON as leafletGeoJSON } from 'leaflet';

import createMap from './Map';
import hyperleafletDataToMap from './Geometry';

const hyperleaflet = (function hyperleaflet() {
  const map = createMap();
  hyperleafletDataToMap(map);

  // TODO - move this to a separate file
  /**
   Adds a GeoJSON object to the map.
   @param {Object} geoJSON - The GeoJSON object to add to the map.
   @returns {void}
   */
  const addGeoJsonToMap = (geoJSON) => {
    leafletGeoJSON(geoJSON).addTo(map);
  };

  return { map, addGeoJsonToMap };
})();

export default hyperleaflet;
