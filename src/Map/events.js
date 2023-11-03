import { Config } from '../config';

function createStateEvent(map, eventName, _leafletEvent) {
  const bounds = map.getBounds();
  const min = bounds.getSouthWest();
  const max = bounds.getNorthEast();
  const bboxString = bounds.toBBoxString();
  return new CustomEvent(eventName, {
    detail: { zoom: map.getZoom(), center: map.getCenter(), bbox: { min, max }, bboxString, _leafletEvent },
  });
}

export function setMapEvents(map) {
  const eventTarget = Config.getTarget('map');
  const { mouse, state, extra } = Config.options.events.map;

  state.forEach((eventName) => {
    map.on(eventName, (e) => {
      const event = createStateEvent(map, `map:${eventName}`, e);
      eventTarget.dispatchEvent(event);
    });
  });

  mouse.forEach((eventName) => {
    map.on(eventName, (e) => {
      const event = new CustomEvent(`map:${eventName}`, { detail: { point: e.latlng }, _leafletEvent: e });
      eventTarget.dispatchEvent(event);
    });
  });

  if (extra.includes('ready')) {
    map.whenReady(() => {
      const event = createStateEvent(map, 'map:ready');
      eventTarget.dispatchEvent(event);
    });
  }
}
