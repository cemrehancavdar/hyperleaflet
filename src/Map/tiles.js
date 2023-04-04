import { tileLayer } from 'leaflet';

const tileLayers = {
  OpenStreetMap: tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }),
  EsriWorldImagery: tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution:
        'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    },
  ),
};

export function addTileLayer(newTileLayer) {
  if (tileLayers[newTileLayer.name]) {
    console.warn(`Tile layer ${newTileLayer.name} already exists. Skipping.`);
    return;
  }
  tileLayers[newTileLayer.name] = newTileLayer.tile;
}

export default tileLayers;
