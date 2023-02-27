// // @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import createHyperleafletMap from '../src/map-utils';

describe('createLeafletMap', () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="map" class="map" data-center="51.5074,-0.1278" data-zoom="10"> </div>`;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should create a leaflet map with correct center and zoom level', () => {
    const mapElement = document.querySelector('#map');
    const map = createHyperleafletMap(mapElement);

    expect(map.getCenter()).toStrictEqual({ lat: 51.5074, lng: -0.1278 });
    expect(map.getZoom()).toBe(10);
  });

  it('should dispatch CustomEvents when the map is interacted with', () => {
    // Create a mock event listener to listen for CustomEvents dispatched from the map
    const mapElement = document.querySelector('#map');
    const map = createHyperleafletMap(mapElement);

    const eventListener = vi.fn();
    window.addEventListener('mapclick', eventListener);
    window.addEventListener('mapzoom', eventListener);
    window.addEventListener('mapmove', eventListener);

    // Simulate a click on the map
    map.fire('click', { latlng: { lat: 0, lng: 0 } });

    // Expect that a 'mapclick' CustomEvent was dispatched with the correct detail
    expect(eventListener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'mapclick',
        detail: expect.objectContaining({
          point: expect.objectContaining({ lat: 0, lng: 0 }),
        }),
      }),
    );

    // Reset the event listener and simulate a zoomend event
    eventListener.mockReset();
    map.fire('zoomend');

    // Expect that a 'mapzoom' CustomEvent was dispatched with the correct detail
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

    // Reset the event listener and simulate a move event
    eventListener.mockReset();
    map.fire('move');

    // Expect that a 'mapmove' CustomEvent was dispatched with the correct detail
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
