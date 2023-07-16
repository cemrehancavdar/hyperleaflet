import {mergeDeep} from "./utils";

export const defaultHyperlaefletObject = {
  options: {
    reverseCoordinateOrder: false,
    events: {
      map: {
        target: 'window',
        click: true,
        zoom: true,
      },
      geometry: {
        target: 'window',
        click: true,
        add: true,
        change: true,
      },
      hyperleaflet: {
        ready: true,
      },
    },
    styles: {},
  },
};

const hyperleafletProxyHandler = {
  set(target, property, value) {
    // Perform deep merge when resetting the options object
    if (property === 'options') {
      target.options = mergeDeep(target.options, value);
    } else {
      target[property] = value;
    }
    return true;
  },
};

const hyperleafletConfig = new Proxy(defaultHyperlaefletObject, hyperleafletProxyHandler);

export default hyperleafletConfig
