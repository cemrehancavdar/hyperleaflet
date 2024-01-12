import { Config } from '../config';

const eventTarget = Config.getTarget('map');

export function setEvents(leafletObject, id, eventType) {
  if (Config.options.events.geometry.click) {
    if (eventType === 'mono') {
      leafletObject.on('click', (e) => {
        const event = new CustomEvent('geometry:click', {
          detail: { clickedPoint: e.latlng, geometry: leafletObject.getLatLng(), id },
        });
        eventTarget.dispatchEvent(event);
      });
    } else if (eventType === 'poly') {
      leafletObject.on('click', (e) => {
        const event = new CustomEvent('geometry:click', {
          detail: {
            clickedPoint: e.latlng,
            geometry: leafletObject.getLatLngs(),
            id,
          },
        });
        eventTarget.dispatchEvent(event);
      });
    } else {
      throw new Error('Invalid event type');
    }
  }
}

export function sendEvent(eventType, leafletGeometry, id, geometryType, target) {
  if (Config.options.events.geometry.add) {
    const event = new CustomEvent(`geometry:${eventType}`, {
      detail: { id, geometryType, target },
    });
    eventTarget.dispatchEvent(event);
  }
}
