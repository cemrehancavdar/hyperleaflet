export function setPointEvents(leafletObject, id) {
  leafletObject.on('click', (e) => {
    const event = new CustomEvent('geometry:click', { detail: { clickedPoint: e.latlng, geometry: leafletObject.getLatLng(), rowId: id } });
    window.dispatchEvent(event);
  });
}

export function setPolyGeometryEvents(leafletObject, id) {
  leafletObject.on('click', (e) => {
    const event = new CustomEvent('geometry:click', { detail: { clickedPoint: e.latlng, geometry: leafletObject.getLatLngs(), rowId: id } });
    window.dispatchEvent(event);
  });
}
