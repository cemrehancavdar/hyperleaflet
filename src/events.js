export default function initMapEvents(map) {
  map.on('click', (e) => {
    const elem = document.getElementById('map');
    const event = new CustomEvent('mapclick', { detail: { latlng: e.latlng } });
    elem.dispatchEvent(event);
  });

  map.on('zoomend', () => {
    const elem = document.getElementById('map');
    const event = new CustomEvent('mapzoom', { detail: { zoom: map.getZoom() } });
    elem.dispatchEvent(event);
  });

  map.on('move', () => {
    const elem = document.getElementById('map');
    const event = new CustomEvent('mapmove', { detail: { bbox: map.getBounds(), center: map.getCenter() } });
    elem.dispatchEvent(event);
  });
}

export function initPointEvents(point, id) {
  point.on('click', (e) => {
    const elem = document.getElementById('map');
    const event = new CustomEvent('pointclick', { detail: { latlng: e.latlng, rowId: id } });
    elem.dispatchEvent(event);
  });
}