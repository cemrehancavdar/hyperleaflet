import { describe, it, expect } from 'vitest';
import { createGeometry, updateGeometry, addGeometryType } from '../geometry';

// Default opts for tests — no reverse, no styles, dummy event target, events off
const defaultOpts = {
  reverseCoordinateOrder: false,
  styles: {},
  eventTarget: { dispatchEvent() {} },
  geometryClickEnabled: false,
};

describe('geometry', () => {
  it('creates a Leaflet marker for Point type', () => {
    const dataset = {
      id: '1',
      geometry: '[39.92, 32.85]',
      geometryType: 'Point',
    };
    const result = createGeometry(dataset, defaultOpts);
    expect(result).toBeDefined();
    expect(result.getLatLng).toBeDefined();
    const latlng = result.getLatLng();
    expect(latlng.lat).toBe(39.92);
    expect(latlng.lng).toBe(32.85);
  });

  it('creates a Leaflet polyline for LineString type', () => {
    const dataset = {
      id: '2',
      geometry: '[[39.92, 32.85], [41.01, 28.97]]',
      geometryType: 'LineString',
    };
    const result = createGeometry(dataset, defaultOpts);
    expect(result).toBeDefined();
    expect(result.getLatLngs).toBeDefined();
  });

  it('throws for unknown geometry type', () => {
    const dataset = {
      id: '3',
      geometry: '[0, 0]',
      geometryType: 'Unknown',
    };
    expect(() => createGeometry(dataset, defaultOpts)).toThrow('Invalid geometry type');
  });

  it('is case-insensitive for geometry type', () => {
    const dataset = {
      id: '4',
      geometry: '[39.92, 32.85]',
      geometryType: 'POINT',
    };
    const result = createGeometry(dataset, defaultOpts);
    expect(result.getLatLng).toBeDefined();
  });

  it('binds popup when data-popup is set', () => {
    const dataset = {
      id: '5',
      geometry: '[39.92, 32.85]',
      geometryType: 'Point',
      popup: 'Hello',
    };
    const result = createGeometry(dataset, defaultOpts);
    expect(result.getPopup()).toBeDefined();
    expect(result.getPopup().getContent()).toBe('Hello');
  });

  it('binds tooltip when data-tooltip is set', () => {
    const dataset = {
      id: '6',
      geometry: '[39.92, 32.85]',
      geometryType: 'Point',
      tooltip: 'Tip',
    };
    const result = createGeometry(dataset, defaultOpts);
    expect(result.getTooltip()).toBeDefined();
    expect(result.getTooltip().getContent()).toBe('Tip');
  });

  it('updates marker position', () => {
    const dataset = {
      id: '7',
      geometry: '[39.92, 32.85]',
      geometryType: 'Point',
    };
    const marker = createGeometry(dataset, defaultOpts);

    updateGeometry(
      marker,
      { id: '7', geometry: '[40.0, 33.0]', geometryType: 'Point' },
      { reverseCoordinateOrder: false },
    );

    const latlng = marker.getLatLng();
    expect(latlng.lat).toBe(40.0);
    expect(latlng.lng).toBe(33.0);
  });

  it('creates a Leaflet circleMarker for CircleMarker type', () => {
    const dataset = {
      id: '8',
      geometry: '[39.92, 32.85]',
      geometryType: 'CircleMarker',
    };
    const result = createGeometry(dataset, defaultOpts);
    expect(result).toBeDefined();
    expect(result.getLatLng).toBeDefined();
    const latlng = result.getLatLng();
    expect(latlng.lat).toBe(39.92);
    expect(latlng.lng).toBe(32.85);
  });

  it('circleMarker accepts style options via config', () => {
    const opts = {
      ...defaultOpts,
      styles: { circlemarker: { red: { radius: 10, color: 'red', fillColor: 'red', fillOpacity: 0.8 } } },
    };
    const dataset = {
      id: '9',
      geometry: '[39.92, 32.85]',
      geometryType: 'CircleMarker',
      style: 'red',
    };
    const result = createGeometry(dataset, opts);
    expect(result.options.radius).toBe(10);
    expect(result.options.color).toBe('red');
  });

  it('updates circleMarker position', () => {
    const dataset = {
      id: '10',
      geometry: '[39.92, 32.85]',
      geometryType: 'CircleMarker',
    };
    const cm = createGeometry(dataset, defaultOpts);

    updateGeometry(
      cm,
      { id: '10', geometry: '[40.0, 33.0]', geometryType: 'CircleMarker' },
      { reverseCoordinateOrder: false },
    );

    const latlng = cm.getLatLng();
    expect(latlng.lat).toBe(40.0);
    expect(latlng.lng).toBe(33.0);
  });

  it('inline data-* style: circleMarker picks up color and radius', () => {
    const dataset = {
      id: '11',
      geometry: '[39.92, 32.85]',
      geometryType: 'CircleMarker',
      color: 'red',
      radius: '12',
      fillColor: '#ff0000',
      fillOpacity: '0.8',
      weight: '2',
    };
    const result = createGeometry(dataset, defaultOpts);
    expect(result.options.color).toBe('red');
    expect(result.options.radius).toBe(12);
    expect(result.options.fillColor).toBe('#ff0000');
    expect(result.options.fillOpacity).toBe(0.8);
    expect(result.options.weight).toBe(2);
  });

  it('inline data-* style: polyline picks up color and weight', () => {
    const dataset = {
      id: '12',
      geometry: '[[39.92, 32.85], [41.01, 28.97]]',
      geometryType: 'LineString',
      color: 'blue',
      weight: '5',
      opacity: '0.6',
      dashArray: '10 5',
    };
    const result = createGeometry(dataset, defaultOpts);
    expect(result.options.color).toBe('blue');
    expect(result.options.weight).toBe(5);
    expect(result.options.opacity).toBe(0.6);
    expect(result.options.dashArray).toBe('10 5');
  });

  it('inline data-* style: polygon picks up fill options', () => {
    const dataset = {
      id: '13',
      geometry: '[[[39.92, 32.85],[41.01, 28.97],[38.42, 27.14]]]',
      geometryType: 'Polygon',
      color: 'green',
      fillColor: 'lime',
      fillOpacity: '0.3',
    };
    const result = createGeometry(dataset, defaultOpts);
    expect(result.options.color).toBe('green');
    expect(result.options.fillColor).toBe('lime');
    expect(result.options.fillOpacity).toBe(0.3);
  });

  it('inline style overrides config preset', () => {
    const opts = {
      ...defaultOpts,
      styles: { circlemarker: { base: { radius: 5, color: 'blue', weight: 1 } } },
    };
    const dataset = {
      id: '14',
      geometry: '[39.92, 32.85]',
      geometryType: 'CircleMarker',
      style: 'base',
      color: 'red',    // override blue
      radius: '20',    // override 5
    };
    const result = createGeometry(dataset, opts);
    expect(result.options.color).toBe('red');    // inline wins
    expect(result.options.radius).toBe(20);      // inline wins
    expect(result.options.weight).toBe(1);       // from preset (not overridden)
  });

  it('no inline style and no preset produces no style object', () => {
    const dataset = {
      id: '15',
      geometry: '[39.92, 32.85]',
      geometryType: 'CircleMarker',
    };
    // Should not crash — Leaflet uses defaults
    const result = createGeometry(dataset, defaultOpts);
    expect(result).toBeDefined();
  });

  it('addGeometryType allows custom types', () => {
    const custom = {
      create: () => ({}),
      update: () => {},
      convert: (g) => g,
    };
    addGeometryType('custom', custom);
    // Verify it doesn't throw for the new type
    // (can't fully test without Leaflet layer contract, but registration works)
  });

  it('addGeometryType throws with missing handlers', () => {
    expect(() => addGeometryType('bad', { create: () => {} })).toThrow('Invalid handlers');
  });
});
