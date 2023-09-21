function createGenericMapEvent(map, eventName) {
  const bounds = map.getBounds();
  const min = bounds.getSouthWest();
  const max = bounds.getNorthEast();
  const bboxString = bounds.toBBoxString();
  const event = new CustomEvent(eventName, {
    detail: { zoom: map.getZoom(), center: map.getCenter(), bbox: { min, max }, bboxString },
  });
  return event;
}

export default function setMapEvents(map) {
  map.on('click', (e) => {
    const event = new CustomEvent('map:click', { detail: { point: e.latlng } });
    window.dispatchEvent(event);
  });

  map.whenReady(() => {
    const event = createGenericMapEvent(map, 'map:load');
    window.dispatchEvent(event);
  });

  map.on('zoomend', () => {
    const event = createGenericMapEvent(map, 'map:zoom');
    window.dispatchEvent(event);
  });

  map.on('move', () => {
    const event = createGenericMapEvent(map, 'map:move');
    window.dispatchEvent(event);
  });

  map.on('moveend', () => {
    const event = createGenericMapEvent(map, 'map:moveend');
    window.dispatchEvent(event);
  });

  map.on('movestart', () => {
    const event = createGenericMapEvent(map, 'map:movestart');
    window.dispatchEvent(event);
  });

  return map;
}

export function sendHyperleafletReady(map) {
  const event = createGenericMapEvent(map, 'hyperleaflet:ready');
  window.dispatchEvent(event);
}
