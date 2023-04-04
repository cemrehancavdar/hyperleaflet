// // @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import L from 'leaflet';
import setGeometryEvents from '../events';

describe('setGeometryEvents', () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="map" class="map" data-center="51.5074,-0.1278" data-zoom="10"> </div>`;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });
  it('should dispatch a "pointclick" event when the geometry is clicked', () => {
    const geometry = new L.Marker([51, 0]);
    setGeometryEvents(geometry, '1');

    const eventListener = vi.fn();
    window.addEventListener('pointclick', eventListener);

    geometry.fire('click');

    expect(eventListener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'pointclick',
        detail: expect.objectContaining({
          point: L.latLng(51, 0),
          rowId: '1',
        }),
      }),
    );
  });
});
