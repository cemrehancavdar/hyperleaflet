import { describe, it, expect, beforeEach } from 'vitest';
import { Config } from '../config';

describe('Config', () => {
  beforeEach(() => {
    Config.reset();
  });

  it('has default options', () => {
    expect(Config.options.mapElement).toBe('#map');
    expect(Config.options.reverseCoordinateOrder).toBe(false);
    expect(Config.options.events.map.click).toBe(true);
    expect(Config.options.events.map.dblclick).toBe(false);
  });

  it('merges options with setter', () => {
    Config.options = { reverseCoordinateOrder: true };
    expect(Config.options.reverseCoordinateOrder).toBe(true);
    // Other defaults should be preserved
    expect(Config.options.mapElement).toBe('#map');
    expect(Config.options.events.map.click).toBe(true);
  });

  it('deep merges event options', () => {
    Config.options = { events: { map: { dblclick: true } } };
    expect(Config.options.events.map.dblclick).toBe(true);
    expect(Config.options.events.map.click).toBe(true);
  });

  it('resets to defaults', () => {
    Config.options = { mapElement: '#custom-map' };
    expect(Config.options.mapElement).toBe('#custom-map');
    Config.reset();
    expect(Config.options.mapElement).toBe('#map');
  });

  it('getTarget returns window by default', () => {
    expect(Config.getTarget()).toBe(window);
  });

  it('getTarget returns document when configured', () => {
    Config.options = { events: { target: 'document' } };
    expect(Config.getTarget()).toBe(document);
  });

  it('getTarget returns hyperleaflet object when configured', () => {
    const mockHyperleaflet = { name: 'test' };
    Config._hyperleaflet = mockHyperleaflet;
    Config.options = { events: { target: 'hyperleaflet' } };
    expect(Config.getTarget()).toBe(mockHyperleaflet);
  });
});
