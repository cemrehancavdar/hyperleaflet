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

const stateEvents = ['zoomstart', 'zoomend', 'movestart', 'moveend', 'zoom', 'move'];
const mouseEvents = [
  'click',
  'dblclick',
  'mousedown',
  'mouseover',
  'mouseout',
  'mousemove',
  'contextmenu',
  'preclick',
];

export function setMapEvents(map) {
  const eventTarget = Config.getTarget('map');
  const mapEvents = Config.options.events.map;
  Object.entries(mapEvents).forEach(([eventName, value]) => {
    if (value) {
      if (stateEvents.includes(eventName)) {
        map.on(eventName, (e) => {
          const event = createStateEvent(map, `map:${eventName}`, e);
          eventTarget.dispatchEvent(event);
        });
      }
      if (mouseEvents.includes(eventName)) {
        map.on(eventName, (e) => {
          const event = new CustomEvent(`map:${eventName}`, { detail: { point: e.latlng }, _leafletEvent: e });
          eventTarget.dispatchEvent(event);
        });
      }
    }
  });

  if (mapEvents.ready) {
    map.whenReady(() => {
      const event = createStateEvent(map, 'map:ready');
      eventTarget.dispatchEvent(event);
    });
  }
}
