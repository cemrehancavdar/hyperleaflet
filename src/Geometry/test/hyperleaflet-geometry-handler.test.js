// // @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import L from 'leaflet';
import { changeLeafletObject, createLeafletObject } from '../leaflet-geometry';
import hyperleafletConfig from '../../config';

describe('createLeafletObject', () => {
  beforeEach(() => {
    hyperleafletConfig.reverseOrderAll = false;
  });
  it('should create a Leaflet marker object for a point geometry', () => {
    const row = {
      geometry: '[-122.414,37.776]',
      popup: 'Hello, world!',
      tooltip: 'I am a point',
      geometryType: 'Point',
      id: '123',
    };
    const marker = createLeafletObject(row);
    expect(marker).toBeInstanceOf(L.Marker);
    expect(marker.getLatLng()).toEqual(L.latLng(-122.414, 37.776));
    expect(marker.getPopup().getContent()).toEqual('Hello, world!');
    expect(marker.getTooltip().getContent()).toEqual('I am a point');
  });
  it('should change Leaflet marker object for a point geometry', () => {
    const row = {
      geometry: '[-122.414,37.776]',
      geometryType: 'Point',
      id: '123',
    };
    const marker = createLeafletObject(row);
    expect(marker).toBeInstanceOf(L.Marker);
    expect(marker.getLatLng()).toEqual(L.latLng(-122.414, 37.776));

    changeLeafletObject(marker, {
      from: '[-122.414,37.776]',
      to: '[-110.414,30.776]',
      attribute: 'data-geometry',
      'data-id': 123,
      dataset: {
        geometry: '[-122.414,37.776]',
        geometryType: 'Point',
        id: '123',
      },
    });
    expect(marker).toBeInstanceOf(L.Marker);
    expect(marker.getLatLng()).toEqual(L.latLng(-110.414, 30.776));
  });

  it('should create a Leaflet marker object for a point geometry reversed', () => {
    const row = {
      geometry: '[-122.414,37.776]',
      popup: 'Hello, world!',
      tooltip: 'I am a point',
      geometryType: 'Point',
      id: '123',
    };
    hyperleafletConfig.reverseOrderAll = true;
    const marker = createLeafletObject(row);
    expect(marker).toBeInstanceOf(L.Marker);
    expect(marker.getLatLng()).toEqual(L.latLng(37.776, -122.414));
    expect(marker.getPopup().getContent()).toEqual('Hello, world!');
    expect(marker.getTooltip().getContent()).toEqual('I am a point');
  });

  it('should create a Leaflet polyline object for a line string geometry', () => {
    const row = {
      geometry: '[[-122.414,37.776],[-122.413,37.775]]',
      popup: 'Hello, world!',
      tooltip: 'I am a linestring',
      geometryType: 'LineString',
      id: '123',
    };
    const polyline = createLeafletObject(row);
    expect(polyline).toBeInstanceOf(L.Polyline);
    expect(polyline.getLatLngs()).toEqual([L.latLng(-122.414, 37.776), L.latLng(-122.413, 37.775)]);
    expect(polyline.getPopup().getContent()).toEqual('Hello, world!');
    expect(polyline.getTooltip().getContent()).toEqual('I am a linestring');
  });

  it('should create a Leaflet polygon object for a polygon geometry', () => {
    const row = {
      geometry: '[[[-122.414,37.776],[-122.413,37.775],[-122.413,37.776],[-122.414,37.776]]]',
      popup: 'Hello, world!',
      tooltip: 'I am a polygon',
      geometryType: 'Polygon',
      id: '123',
    };
    const polygon = createLeafletObject(row);
    expect(polygon).toBeInstanceOf(L.Polygon);
    expect(polygon.getLatLngs()).toEqual([
      [L.latLng(-122.414, 37.776), L.latLng(-122.413, 37.775), L.latLng(-122.413, 37.776)],
    ]);
    expect(polygon.getPopup().getContent()).toEqual('Hello, world!');
    expect(polygon.getTooltip().getContent()).toEqual('I am a polygon');
  });

  it('should return null for an unsupported geometry type', () => {
    const row = {
      geometry: '[-122.414,37.776]',
      popup: 'Hello, world!',
      tooltip: 'I am unsupported',
      geometryType: 'Unsupported',
      id: '123',
    };

    const result = createLeafletObject(row);
    expect(result).toBeNull();
  });

  it('should create a Leaflet polygon object for a polygon geometry reverse order', () => {
    const row = {
      geometry: '[[[-122.414,37.776],[-122.413,37.775],[-122.413,37.776],[-122.414,37.776]]]',
      popup: 'Hello, world!',
      tooltip: 'I am a polygon',
      geometryType: 'Polygon',
      id: '123',
      reverseOrder: '',
    };
    const polygon = createLeafletObject(row);
    expect(polygon).toBeInstanceOf(L.Polygon);
    expect(polygon.getLatLngs()).toEqual([
      [L.latLng(37.776, -122.414), L.latLng(37.775, -122.413), L.latLng(37.776, -122.413)],
    ]);
    expect(polygon.getPopup().getContent()).toEqual('Hello, world!');
    expect(polygon.getTooltip().getContent()).toEqual('I am a polygon');
  });

  it('should create a Leaflet imageOverlay given imageUrl', () => {
    const dataset = {
      l: 'imageOverlay',
      imageUrl: '/static/image.png',
      latLngBounds: '[[0, 1], [2, 3]]',
    };
    const overlay = createLeafletObject(dataset);
    expect(overlay).toBeInstanceOf(L.ImageOverlay);
    expect(overlay.getBounds()).toEqual(
      L.latLngBounds([
        [0, 1],
        [2, 3],
      ]),
    );
  });

  it('should change imageOverlay latLngBounds', () => {
    const dataset = {
      l: 'imageOverlay',
      imageUrl: 'url.png',
      latLngBounds: '[[0, 1], [2, 3]]',
    };
    let overlay = createLeafletObject(dataset);
    const change = {
      'data-id': 123,
      attribute: 'data-image-bounds',
      dataset,
      from: '[[0, 1], [2, 3]]',
      to: '[[1, 1], [2, 3]]',
    };
    overlay = changeLeafletObject(overlay, change);
    expect(overlay).toBeInstanceOf(L.ImageOverlay);
    expect(overlay.getBounds()).toEqual(
      L.latLngBounds([
        [1, 1],
        [2, 3],
      ]),
    );
  });

  it('should change imageOverlay imageurl', () => {
    const dataset = {
      l: 'imageOverlay',
      imageUrl: 'foo.png',
      latLngBounds: '[[0, 1], [2, 3]]',
    };
    let overlay = createLeafletObject(dataset);
    const change = {
      'data-id': 123,
      attribute: 'data-image-url',
      dataset,
      from: 'foo.png',
      to: 'bar.png',
    };
    overlay = changeLeafletObject(overlay, change);
    expect(overlay).toBeInstanceOf(L.ImageOverlay);
  });
});
