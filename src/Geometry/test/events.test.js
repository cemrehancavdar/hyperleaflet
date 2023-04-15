// // @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import L from 'leaflet';
import {setPointEvents, setPolyGeometryEvents} from '../events';

describe('setGeometryEvents', () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="map" class="map" data-center="51.5074,-0.1278" data-zoom="10"> </div>`;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });
  it('should dispatch a "geomclick" event when the point is clicked', () => {
    const geometry = new L.Marker([51, 0]);
    setPointEvents(geometry, '1');

    const eventListener = vi.fn();
    window.addEventListener('geomclick', eventListener);

    geometry.fire('click');

    expect(eventListener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'geomclick',
        detail: expect.objectContaining({
          geometry: L.latLng(51, 0),
          rowId: '1',
        }),
      }),
    );
  });
  it('should dispatch a "geomclick" event when the geometry is clicked', () => {
    const geometry = new L.Polyline([[51, 0],[52,2]]);
    setPolyGeometryEvents(geometry, '2');

    const eventListener = vi.fn();
    window.addEventListener('geomclick', eventListener);

    geometry.fire('click');

    expect(eventListener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'geomclick',
        detail: expect.objectContaining({
          geometry: [L.latLng(51, 0),L.latLng(52,2)],
          rowId: '2',
        }),
      }),
    );
  });
});
