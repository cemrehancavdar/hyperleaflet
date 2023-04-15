export default function setMapEvents(map) {
  map.on('click', (e) => {
    const event = new CustomEvent('map:click', { detail: { point: e.latlng } });
    window.dispatchEvent(event);
  });

  map.on('zoomend', () => {
    const event = new CustomEvent('map:zoom', {
      detail: { zoom: map.getZoom(), center: map.getCenter(), bbox: map.getBounds() },
    });
    window.dispatchEvent(event);
  });

  map.on('move', () => {
    const event = new CustomEvent('map:move', {
      detail: { zoom: map.getZoom(), center: map.getCenter(), bbox: map.getBounds() },
    });
    window.dispatchEvent(event);
  });

  return map;
}
