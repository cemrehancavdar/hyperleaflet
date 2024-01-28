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
  _hyperleaflet: null,
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

  getTarget() {
    const { target } = this.options.events;
    switch (target) {
      case 'window':
        return window;
      case 'document':
        return document;
      case 'hyperleaflet':
      default:
        return this._hyperleaflet;
    }
  },
};
