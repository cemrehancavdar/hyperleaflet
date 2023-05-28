export default function setMapEvents(map) {
  map.on('click', (e) => {
    const event = new CustomEvent('map:click', { detail: { point: e.latlng } });
    window.dispatchEvent(event);
  });

  map.whenReady(() => {
    const bounds = map.getBounds();
    const min = bounds.getSouthWest();
    const max = bounds.getNorthEast();
    const bboxString = bounds.toBBoxString();
    const event = new CustomEvent('map:load', {
      detail: { zoom: map.getZoom(), center: map.getCenter(), bbox: { min, max }, bboxString },
    });
    window.dispatchEvent(event);
  });

  map.on('zoomend', () => {
    const bounds = map.getBounds();
    const min = bounds.getSouthWest();
    const max = bounds.getNorthEast();
    const bboxString = bounds.toBBoxString();
    const event = new CustomEvent('map:zoom', {
      detail: { zoom: map.getZoom(), center: map.getCenter(), bbox: { min, max }, bboxString },
    });
    window.dispatchEvent(event);
  });

  map.on('move', () => {
    const bounds = map.getBounds();
    const min = bounds.getSouthWest();
    const max = bounds.getNorthEast();
    const bboxString = bounds.toBBoxString();
    const event = new CustomEvent('map:move', {
      detail: { zoom: map.getZoom(), center: map.getCenter(), bbox: { min, max }, bboxString },
    });
    window.dispatchEvent(event);
  });

  return map;
}

export function sendHyperleafletReady(map) {
  const bounds = map.getBounds();
  const min = bounds.getSouthWest();
  const max = bounds.getNorthEast();
  const bboxString = bounds.toBBoxString();
  const event = new CustomEvent('hyperleaflet:ready', {
    detail: { zoom: map.getZoom(), center: map.getCenter(), bbox: { min, max }, bboxString },
  });
  window.dispatchEvent(event);
}
