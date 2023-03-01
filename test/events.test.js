// // @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import createHyperleafletMap from '../src/map-utils';

describe('events', () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="map" class="map" data-center="51.5074,-0.1278" data-zoom="10"> </div>`;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should zoomend return valid mapzoom', () => {
    // Create a mock event listener to listen for CustomEvents dispatched from the map
    const mapElement = document.querySelector('#map');
    const map = createHyperleafletMap(mapElement);

    const eventListener = vi.fn();
    window.addEventListener('mapclick', eventListener);

    map.fire('click', { latlng: { lat: 0, lng: 0 } });

    expect(eventListener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'mapclick',
        detail: expect.objectContaining({
          point: expect.objectContaining({ lat: 0, lng: 0 }),
        }),
      }),
    );
  });

  it('should zoomend return valid mapzoom', () => {
    const mapElement = document.querySelector('#map');
    const map = createHyperleafletMap(mapElement);

    const eventListener = vi.fn();
    window.addEventListener('mapzoom', eventListener);
    map.fire('zoomend');

    expect(eventListener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'mapzoom',
        detail: expect.objectContaining({
          zoom: map.getZoom(),
          center: map.getCenter(),
          bbox: map.getBounds(),
        }),
      }),
    );
  });
  it('should move return valid mapmove', () => {
    const mapElement = document.querySelector('#map');
    const map = createHyperleafletMap(mapElement);

    const eventListener = vi.fn();

    window.addEventListener('mapmove', eventListener);
    map.fire('move');

    expect(eventListener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'mapmove',
        detail: expect.objectContaining({
          zoom: map.getZoom(),
          center: map.getCenter(),
          bbox: map.getBounds(),
        }),
      }),
    );
  });
});
