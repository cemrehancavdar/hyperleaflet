// // @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import L from 'leaflet';
import createLeafletObject from '../leaflet-geometry';

describe('createLeafletObject', () => {
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
    expect(polyline.getLatLngs()).toEqual([L.latLng(37.776, -122.414), L.latLng(37.775, -122.413)]);
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
      [L.latLng(37.776, -122.414), L.latLng(37.775, -122.413), L.latLng(37.776, -122.413)],
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
});
