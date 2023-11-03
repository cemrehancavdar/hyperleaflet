import { Config } from '../config';

export function sendHyperleafletReady(map) {
  if (Config.options.events.hyperleaflet.state.includes('ready')) {
    const bounds = map.getBounds();
    const min = bounds.getSouthWest();
    const max = bounds.getNorthEast();
    const bboxString = bounds.toBBoxString();
    const event = new CustomEvent('hyperleaflet:ready', {
      detail: { zoom: map.getZoom(), center: map.getCenter(), bbox: { min, max }, bboxString },
    });
    window.dispatchEvent(event);
  }
}
