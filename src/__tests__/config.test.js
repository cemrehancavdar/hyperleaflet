import { describe, it, expect, beforeEach } from 'vitest';
import { Hyperleaflet } from '../hyperleaflet';

const config = Hyperleaflet.config;

describe('Config (via Hyperleaflet.config)', () => {
  beforeEach(() => {
    config.reset();
  });

  it('has default options', () => {
    expect(config.options.mapElement).toBe('#map');
    expect(config.options.reverseCoordinateOrder).toBe(false);
    expect(config.options.events.map.click).toBe(true);
    expect(config.options.events.map.dblclick).toBe(false);
    expect(config.options.locate).toBe(false);
    expect(config.options.events.locate.found).toBe(true);
    expect(config.options.events.locate.error).toBe(true);
  });

  it('merges options with setter', () => {
    config.options = { reverseCoordinateOrder: true };
    expect(config.options.reverseCoordinateOrder).toBe(true);
    // Other defaults should be preserved
    expect(config.options.mapElement).toBe('#map');
    expect(config.options.events.map.click).toBe(true);
  });

  it('deep merges event options', () => {
    config.options = { events: { map: { dblclick: true } } };
    expect(config.options.events.map.dblclick).toBe(true);
    expect(config.options.events.map.click).toBe(true);
  });

  it('resets to defaults', () => {
    config.options = { mapElement: '#custom-map' };
    expect(config.options.mapElement).toBe('#custom-map');
    config.reset();
    expect(config.options.mapElement).toBe('#map');
  });

  it('getTarget returns window by default', () => {
    expect(config.getTarget()).toBe(window);
  });

  it('getTarget returns document when configured', () => {
    config.options = { events: { target: 'document' } };
    expect(config.getTarget()).toBe(document);
  });

  it('getTarget returns hyperleaflet object when configured', () => {
    config.options = { events: { target: 'hyperleaflet' } };
    expect(config.getTarget()).toBe(Hyperleaflet);
  });

  it('can enable locate control', () => {
    config.options = { locate: true };
    expect(config.options.locate).toBe(true);
    // Other defaults preserved
    expect(config.options.mapElement).toBe('#map');
  });

  it('can disable locate events independently', () => {
    config.options = { events: { locate: { found: false } } };
    expect(config.options.events.locate.found).toBe(false);
    expect(config.options.events.locate.error).toBe(true);
  });

  it('resets locate to defaults', () => {
    config.options = { locate: true, events: { locate: { found: false } } };
    expect(config.options.locate).toBe(true);
    config.reset();
    expect(config.options.locate).toBe(false);
    expect(config.options.events.locate.found).toBe(true);
  });
});
