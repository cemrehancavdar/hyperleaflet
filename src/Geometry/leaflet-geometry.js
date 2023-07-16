import { marker, polyline, polygon, GeoJSON } from 'leaflet';
import { setPointEvents, setPolyGeometryEvents } from './events';
import hyperleafletConfig from '../config';

const createPointGeometry = (parsedGeometry, options) => {
  const { hyperleafletOptions, reverseOrder, style } = options;
  const {reverseCoordinateOrder} = hyperleafletOptions;
  const styles = hyperleafletOptions;
  const isLonLat = reverseCoordinateOrder || (reverseOrder !== undefined)
  const geometry = isLonLat ? [...parsedGeometry].reverse() : parsedGeometry;
  const leafletGeometry = marker(geometry, styles?.point?.[style]);
  if (options.popup) {
    leafletGeometry.bindPopup(options.popup);
  }
  if (options.tooltip) {
    leafletGeometry.bindTooltip(options.tooltip);
  }
  setPointEvents(leafletGeometry, options.id);
  return leafletGeometry;
};

const createLineGeometry = (parsedGeometry, options) => {
  const { hyperleafletOptions, reverseOrder } = options;
  const {reverseCoordinateOrder} = hyperleafletOptions;
  const isLonLat = reverseCoordinateOrder || (reverseOrder !== undefined)
  const geometry = isLonLat ? GeoJSON.coordsToLatLngs(parsedGeometry, 0) : parsedGeometry;
  const leafletGeometry = polyline(geometry);
  if (options.popup) {
    leafletGeometry.bindPopup(options.popup);
  }
  if (options.tooltip) {
    leafletGeometry.bindTooltip(options.tooltip);
  }
  setPolyGeometryEvents(leafletGeometry, options.id);
  return leafletGeometry;
};

const createPolygonGeometry = (parsedGeometry, options) => {
  const { hyperleafletOptions, reverseOrder } = options;
  const {reverseCoordinateOrder} = hyperleafletOptions;
  const isLonLat = reverseCoordinateOrder || (reverseOrder !== undefined)
  const geometry = isLonLat ? GeoJSON.coordsToLatLngs(parsedGeometry, 1) : parsedGeometry;
  const leafletGeometry = polygon(geometry);
  if (options.popup) {
    leafletGeometry.bindPopup(options.popup);
  }
  if (options.tooltip) {
    leafletGeometry.bindTooltip(options.tooltip);
  }
  setPolyGeometryEvents(leafletGeometry, options.id);
  return leafletGeometry;
};

const createGeometry = (geometryType) => (parsedGeometry, options) => {
  switch (geometryType) {
    case 'Point':
      return createPointGeometry(parsedGeometry, options);
    case 'LineString':
      return createLineGeometry(parsedGeometry, options);
    case 'Polygon':
      return createPolygonGeometry(parsedGeometry, options);
    default:
      // eslint-disable-next-line no-console
      console.warn(`${geometryType} is not supported`);
      return null;
  }
};

export default function createLeafletObject(row) {
  const { geometry,  geometryType } = row;
  const parsedGeometry = JSON.parse(geometry);
  const hyperleafletOptions = hyperleafletConfig.options;
  const createGeometryFn = createGeometry(geometryType);
  return createGeometryFn(parsedGeometry, { ...row, hyperleafletOptions });
}
