import { describe, it, expect, beforeEach } from 'vitest';
import { Geometry } from '../Geometry/geometry';
import { Config } from '../config';

describe('Geometry', () => {
  beforeEach(() => {
    Config.reset();
  });

  it('has built-in types: point, linestring, polygon', () => {
    expect(Geometry.types.point).toBeDefined();
    expect(Geometry.types.linestring).toBeDefined();
    expect(Geometry.types.polygon).toBeDefined();
  });

  it('allows adding custom geometry types', () => {
    const customType = {
      create: () => ({}),
      update: () => {},
      convert: (g) => g,
    };
    Geometry.addType('custom', customType);
    expect(Geometry.types.custom).toBe(customType);
  });

  it('throws when adding type with missing handlers', () => {
    expect(() => Geometry.addType('bad', { create: () => {} })).toThrow('Invalid handlers');
  });

  it('shouldReverseCoordinates returns true when config reverseCoordinateOrder is true', () => {
    expect(Geometry.shouldReverseCoordinates(true, undefined)).toBe(true);
  });

  it('shouldReverseCoordinates returns true when reverseOrder attribute is present', () => {
    expect(Geometry.shouldReverseCoordinates(false, '')).toBe(true);
  });

  it('shouldReverseCoordinates returns false when both are false/undefined', () => {
    expect(Geometry.shouldReverseCoordinates(false, undefined)).toBe(false);
  });

  it('createGeometry creates a Leaflet marker for Point type', () => {
    const dataset = {
      id: '1',
      geometry: '[39.92, 32.85]',
      geometryType: 'Point',
    };
    const result = Geometry.createGeometry(dataset);
    expect(result).toBeDefined();
    expect(result.getLatLng).toBeDefined();
    const latlng = result.getLatLng();
    expect(latlng.lat).toBe(39.92);
    expect(latlng.lng).toBe(32.85);
  });

  it('createGeometry creates a Leaflet polyline for LineString type', () => {
    const dataset = {
      id: '2',
      geometry: '[[39.92, 32.85], [41.01, 28.97]]',
      geometryType: 'LineString',
    };
    const result = Geometry.createGeometry(dataset);
    expect(result).toBeDefined();
    expect(result.getLatLngs).toBeDefined();
  });

  it('createGeometry throws for unknown geometry type', () => {
    const dataset = {
      id: '3',
      geometry: '[0, 0]',
      geometryType: 'Unknown',
    };
    expect(() => Geometry.createGeometry(dataset)).toThrow('Invalid geometry type');
  });

  it('createGeometry is case-insensitive for geometry type', () => {
    const dataset = {
      id: '4',
      geometry: '[39.92, 32.85]',
      geometryType: 'POINT',
    };
    const result = Geometry.createGeometry(dataset);
    expect(result.getLatLng).toBeDefined();
  });

  it('createGeometry binds popup when data-popup is set', () => {
    const dataset = {
      id: '5',
      geometry: '[39.92, 32.85]',
      geometryType: 'Point',
      popup: 'Hello',
    };
    const result = Geometry.createGeometry(dataset);
    expect(result.getPopup()).toBeDefined();
    expect(result.getPopup().getContent()).toBe('Hello');
  });

  it('createGeometry binds tooltip when data-tooltip is set', () => {
    const dataset = {
      id: '6',
      geometry: '[39.92, 32.85]',
      geometryType: 'Point',
      tooltip: 'Tip',
    };
    const result = Geometry.createGeometry(dataset);
    expect(result.getTooltip()).toBeDefined();
    expect(result.getTooltip().getContent()).toBe('Tip');
  });

  it('updateGeometry updates marker position', () => {
    const dataset = {
      id: '7',
      geometry: '[39.92, 32.85]',
      geometryType: 'Point',
    };
    const marker = Geometry.createGeometry(dataset);

    Geometry.updateGeometry(marker, {
      id: '7',
      geometry: '[40.0, 33.0]',
      geometryType: 'Point',
    });

    const latlng = marker.getLatLng();
    expect(latlng.lat).toBe(40.0);
    expect(latlng.lng).toBe(33.0);
  });
});
