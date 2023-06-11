// // @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import createHyperleafletMap from '../map';

describe('events', () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="map" class="map" data-center="[51.5074,-0.1278]" data-zoom="10"> </div>`;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should click return valid map:click', () => {
    // Create a mock event listener to listen for CustomEvents dispatched from the map
    const mapElement = document.querySelector('#map');
    const map = createHyperleafletMap(mapElement);

    const eventListener = vi.fn();
    window.addEventListener('map:click', eventListener);

    map.fire('click', { latlng: { lat: 0, lng: 0 } });

    expect(eventListener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'map:click',
        detail: expect.objectContaining({
          point: expect.objectContaining({ lat: 0, lng: 0 }),
        }),
      }),
    );
  });

  it('should zoomend return valid map:zoom', () => {
    const mapElement = document.querySelector('#map');
    const map = createHyperleafletMap(mapElement);

    const eventListener = vi.fn();
    window.addEventListener('map:zoom', eventListener);
    map.fire('zoomend');

    const center = map.getCenter();
    const bounds = map.getBounds();
    const min = bounds.getSouthWest();
    const max = bounds.getNorthEast();
    const bboxString = bounds.toBBoxString();
    expect(eventListener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'map:zoom',
        detail: expect.objectContaining({
          zoom: map.getZoom(),
          center: { lat: center.lat, lng: center.lng },
          bbox: { min, max },
          bboxString,
        }),
      }),
    );
  });
  it('should move return valid map:move', () => {
    const mapElement = document.querySelector('#map');
    const map = createHyperleafletMap(mapElement);

    const eventListener = vi.fn();

    window.addEventListener('map:move', eventListener);
    map.fire('move');

    const center = map.getCenter();
    const bounds = map.getBounds();
    const min = bounds.getSouthWest();
    const max = bounds.getNorthEast();
    const bboxString = bounds.toBBoxString();

    expect(eventListener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'map:move',
        detail: expect.objectContaining({
          zoom: map.getZoom(),
          center: { lat: center.lat, lng: center.lng },
          bbox: { min, max },
          bboxString,
        }),
      }),
    );
  });
});
