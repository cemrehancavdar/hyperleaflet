import { mergeDeep } from './utils';

const defaultOptions = {
  reverseCoordinateOrder: false,
  mapElement: '#map',
  events: {
    target: 'window',
    map: {
      click: true,
      dblclick: false,
      mousedown: false,
      mouseover: false,
      mousemove: false,
      mouseout: false,
      contextmenu: false,
      preclick: false,
      zoom: true,
      move: true,
      zoomstart: false,
      zoomend: false,
      movestart: false,
      moveend: false,
      ready: true,
    },
    geometry: {
      click: true,
      move: false,
      add: false,
    },
    hyperleaflet: {
      ready: true,
    },
  },
  styles: {},
};
export const Config = {
  _options: defaultOptions,

  get options() {
    return this._options;
  },

  set options(options) {
    this._options = mergeDeep(this._options, options);
  },

  reset() {
    this._options = defaultOptions;
  },

  getTargetElement(target, type) {
    if (typeof target === 'string') {
      return target;
    }
    if (target.constructor === Object) {
      return target[type] || 'window';
    }
    return 'window';
  },

  getTarget(type) {
    const { target } = this.options.events;
    const eventTarget = this.getTargetElement(target, type);
    switch (eventTarget) {
      case 'window':
        return window;
      case 'document':
        return document;
      case 'map':
        return this.options.mapElement;
      case 'hyperleaflet-source':
        return document.querySelector('[data-hyperleaflet-source]');
      default:
        return document.querySelector(eventTarget);
    }
  },
};
