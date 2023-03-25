export default function setGeometryEvents(leafletObject, id) {
  leafletObject.on('click', () => {
    const event = new CustomEvent('pointclick', { detail: { point: leafletObject.getLatLng(), rowId: id } });
    window.dispatchEvent(event);
  });
}
