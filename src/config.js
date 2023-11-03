import { mergeDeep } from './utils';

const defaultOptions = {
  reverseCoordinateOrder: false,
  mapElement: '#map',
  events: {
    map: {
      target: 'window',
      mouse: ['click'],
      state: ['zoom', 'move'],
      extra: ['ready'],
    },
    geometry: {
      target: 'window',
      mouse: ['click'],
      state: ['add'],
    },
    hyperleaflet: {
      target: 'window',
      state: ['ready'],
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
