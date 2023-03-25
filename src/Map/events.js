export default function setMapEvents(map) {
  map.on('click', (e) => {
    const event = new CustomEvent('mapclick', { detail: { point: e.latlng } });
    window.dispatchEvent(event);
  });

  map.on('zoomend', () => {
    const event = new CustomEvent('mapzoom', {
      detail: { zoom: map.getZoom(), center: map.getCenter(), bbox: map.getBounds() },
    });
    window.dispatchEvent(event);
  });

  map.on('move', () => {
    const event = new CustomEvent('mapmove', {
      detail: { zoom: map.getZoom(), center: map.getCenter(), bbox: map.getBounds() },
    });
    window.dispatchEvent(event);
  });

  return map;
}
