import * as L from 'leaflet';
import { setEvents } from './events';
import { Config } from '../config';

const convertGeometryCoordinates = (geometry) => {
  if (typeof geometry === 'string') {
    try {
      return JSON.parse(geometry);
    } catch (error) {
      console.warn('Failed to parse the geometry string.');
      return null;
    }
  }
  return null;
};

const createHyperleafletGeometryParams = (dataset) => {
  const hyperleafletOptions = Config.options;
  const { geometry, geometryType, style, popup, tooltip, id } = dataset;
  const { styles } = hyperleafletOptions;

  const convertedGeometry = convertGeometryCoordinates(geometry);
  const computedStyle = styles?.[geometryType]?.[style];

  const options = {
    style: computedStyle,
    popup,
    tooltip,
    id,
  };

  return { geometry: convertedGeometry, geometryType, options };
};

export const Geometry = {
  types: {
    point: {
      create: (geometry, styleOptions, _extraParams) => L.marker(geometry, styleOptions),
      update: (leafletObject, geometry) => leafletObject.setLatLng(geometry),
      convert: (geometry, isLonLat) => (isLonLat ? [...geometry].reverse() : geometry),
      eventType: 'mono',
    },
    linestring: {
      create: (geometry, styleOptions, _extraParams) => L.polyline(geometry, styleOptions),
      update: (leafletObject, geometry) => leafletObject.setLatLngs(geometry),
      convert: (geometry, isLonLat) => (isLonLat ? L.GeoJSON.coordsToLatLngs(geometry, 0) : geometry),
      eventType: 'poly',
    },
    polygon: {
      create: (geometry, styleOptions, _extraParams) => L.polygon(geometry, styleOptions),
      update: (leafletObject, geometry) => leafletObject.setLatLngs(geometry),
      convert: (geometry, isLonLat) => (isLonLat ? L.GeoJSON.coordsToLatLngs(geometry, 1) : geometry),
      eventType: 'poly',
    },
  },

  addType(type, handlers) {
    if (!handlers.create || !handlers.update || !handlers.convert) {
      throw new Error('Invalid handlers provided.');
    }

    this.types[type] = handlers;
  },

  shouldReverseCoordinates(reverseCoordinateOrder, reverseOrder) {
    return reverseCoordinateOrder || reverseOrder !== undefined;
  },
  applyPopupAndTooltip(leafletGeometry, options) {
    if (options.popup) {
      leafletGeometry.bindPopup(options.popup);
    }
    if (options.tooltip) {
      leafletGeometry.bindTooltip(options.tooltip);
    }
  },

  createGeometry(dataset) {
    const { reverseOrder, ...extraOptions } = dataset;
    const { reverseCoordinateOrder } = Config.options;
    const { geometry, geometryType, options } = createHyperleafletGeometryParams(dataset, Config.options);

    const geometryCreator = this.types[geometryType.toLowerCase()];

    const isLonLat = this.shouldReverseCoordinates(reverseCoordinateOrder, reverseOrder);

    if (!geometryCreator) {
      throw new Error(`Invalid geometry type: ${geometryType}`);
    }

    const convertedGeometry = geometryCreator.convert(geometry, isLonLat);

    const leafletGeometry = geometryCreator.create(convertedGeometry, options.style, extraOptions);
    this.applyPopupAndTooltip(leafletGeometry, options);

    setEvents(leafletGeometry, options.id, geometryCreator.eventType);
    return leafletGeometry;
  },

  updateGeometry(leafletObject, dataset) {
    const { reverseOrder } = dataset;
    const { reverseCoordinateOrder } = Config.options;

    const isLonLat = this.shouldReverseCoordinates(reverseCoordinateOrder, reverseOrder);
    const { geometry, geometryType } = createHyperleafletGeometryParams(dataset);
    const typeInfo = this.types[geometryType.toLowerCase()];

    if (!typeInfo) {
      throw new Error(`Invalid geometry type: ${geometryType}`);
    }

    const convertedGeometry = typeInfo.convert(geometry, isLonLat);
    return typeInfo.update(leafletObject, convertedGeometry);
  },
};
