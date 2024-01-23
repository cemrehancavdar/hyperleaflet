import { Config } from '../config';

export function sendHyperleafletReady(map) {
  const eventTarget = Config.getTarget('hyperleaflet');

  if (Config.options.events.hyperleaflet.ready) {
    const bounds = map.getBounds();
    const min = bounds.getSouthWest();
    const max = bounds.getNorthEast();
    const bboxString = bounds.toBBoxString();
    const event = new CustomEvent('hyperleaflet:ready', {
      detail: { zoom: map.getZoom(), center: map.getCenter(), bbox: { min, max }, bboxString },
    });
    eventTarget.dispatchEvent(event);
  }
}
