import { mergeDeep } from './utils';

const defaultOptions = {
  reverseCoordinateOrder: false,
  mapElement: '#map',
  events: {
    map: {
      target: 'window',
      click: true,
      dlbclick: false,
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
      target: 'window',
      click: true,
      move: false,
      add: false,
    },
    hyperleaflet: {
      target: 'window',
      ready: true
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

  getTarget(type) {
    const { events } = this.options;
    const { target } = events[type];
    switch (target) {
      case 'window':
        return window;
      case 'document':
        return document;
      case 'map':
        return this.options.mapElement;
      case 'hyperleaflet':
        return document.querySelector('[data-hyperleaflet-source]');
      default:
        return document.querySelector(target);
    }
  },
};
