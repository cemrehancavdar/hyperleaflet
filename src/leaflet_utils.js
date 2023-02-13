import L from 'leaflet';
import { setGeometryEvents } from './events';

export default function createLeafletObject(row) {
  const { geometry, popup, geometryType, id } = row;
  const parsedGeometry = JSON.parse(geometry);
  switch (geometryType) {
    case 'Point': {
      const marker = L.marker(parsedGeometry);
      if (popup) {
        marker.bindPopup(popup);
      }
      setGeometryEvents(marker, id);
      return marker;
    }
    case 'LineString': {
      const flippedGeometry = L.GeoJSON.coordsToLatLngs(parsedGeometry, 1);
      const line = L.polyline(flippedGeometry);
      if (popup) {
        line.bindPopup(popup);
      }
      setGeometryEvents(line, id);
      return line;
    }
    case 'Polygon': {
      const flippedGeometry = L.GeoJSON.coordsToLatLngs(parsedGeometry, 1);
      const polygon = L.polygon(flippedGeometry);
      if (popup) {
        polygon.bindPopup(popup);
      }
      setGeometryEvents(polygon, id);
      return polygon;
    }
    default: {
      // eslint-disable-next-line no-console
      console.warn(`${geometryType} is not supported`);
      return null;
    }
  }
}
