/* eslint-disable no-underscore-dangle */
// // @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import createHyperleafletMap, { createHyperleafletTiles, getDefaultHyperleafletTile } from '../map';
import TILE_LAYERS from '../tiles';

describe('createLeafletMap', () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="map" class="map" data-center="[51.5074, -0.1278]" data-zoom="10"> </div>`;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should create a leaflet map with correct center and zoom level', () => {
    const mapElement = document.querySelector('#map');
    const map = createHyperleafletMap(mapElement);

    expect(map.getCenter()).toStrictEqual({ lng: -0.1278, lat: 51.5074 });
    expect(map.getZoom()).toBe(10);
  });
});

describe('createHyperleafletTiles', () => {
  let tileLayerElementList;

  beforeEach(() => {
    // Set up the tile layer element list
    tileLayerElementList = document.createElement('div');
    tileLayerElementList.innerHTML = `
      <div data-tile="OpenStreetMap" data-min-zoom="0" data-max-zoom="18"></div>
      <div data-tile="EsriWorldImagery" data-min-zoom="0" data-max-zoom="14" data-default-tile="true"></div>
      <div data-tile="NotATileLayer"></div>
      <div data-tile="OpenTopoMap" data-tile-url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"></div>
    `;
  });

  afterEach(() => {
    // Clean up the tile layer element list
    tileLayerElementList = null;
  });

  it('returns the Open Street Map and null tile controller if there are no valid tile layer elements', () => {
    // Arrange
    const emptyTileLayerElementList = document.createElement('div');

    // Act
    const result = createHyperleafletTiles(emptyTileLayerElementList.children);

    // Assert
    expect(result.defaultHyperleafletTile).toEqual(TILE_LAYERS.OpenStreetMap);
    expect(result.tileController).toBeNull();
  });

  it('sets the min and max zoom levels of each valid tile layer', () => {
    // Arrange

    // Act
    const result = createHyperleafletTiles(tileLayerElementList.children);

    // Assert
    expect(result.defaultHyperleafletTile.options.minZoom).toEqual('0');
    expect(result.defaultHyperleafletTile.options.maxZoom).toEqual('14');
    expect(
      result.tileController._layers.find((layer) => layer.name === 'OpenStreetMap').layer.options.minZoom,
    ).toEqual('0');
    expect(
      result.tileController._layers.find((layer) => layer.name === 'OpenStreetMap').layer.options.maxZoom,
    ).toEqual('18');
    expect(
      result.tileController._layers.find((layer) => layer.name === 'EsriWorldImagery').layer.options.minZoom,
    ).toEqual('0');
    expect(
      result.tileController._layers.find((layer) => layer.name === 'EsriWorldImagery').layer.options.maxZoom,
    ).toEqual('14');
  });

  it('returns the default tile layer and tile controller with the expected tile layers', () => {
    // Act
    const result = createHyperleafletTiles(tileLayerElementList.children);

    // Assert
    expect(result.defaultHyperleafletTile._url).toEqual(TILE_LAYERS.EsriWorldImagery._url);
    expect(result.tileController._layers.at(0).name).toEqual('OpenStreetMap');
    expect(result.tileController._layers.at(1).name).toEqual('EsriWorldImagery');
    expect(result.tileController._layers.at(2).name).toEqual('OpenTopoMap');
    const notATileLayer = result.tileController._layers.find((layer) => layer.name === 'NotATileLayer');
    expect(notATileLayer).toBeUndefined();
  });

  it('return tile layer if a tile layer url is provided', () => {
    // Act
    const result = createHyperleafletTiles(tileLayerElementList.children);

    // Assert
    expect(result.tileController._layers.at(2).layer._url).toEqual('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png');
  });

  it('logs a warning message if a tile layer is not found', () => {
    // Arrange
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation();

    // Act
    createHyperleafletTiles(tileLayerElementList.children);

    // Assert
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      `NotATileLayer is not in: \nOpenStreetMap\nEsriWorldImagery\nOpenTopoMap`,
    );

    // Clean up
    consoleWarnSpy.mockRestore();
  });
});

describe('getDefaultHyperleafletTile', () => {
  const tileLayerElementList = [
    { dataset: { tile: 'OpenStreetMap', defaultTile: true } },
    { dataset: { tile: 'EsriWorldImagery' } },
  ];
  it('should return the default tile if it exists in the list', () => {
    expect(getDefaultHyperleafletTile(tileLayerElementList)).toEqual(TILE_LAYERS.OpenStreetMap);
  });

  it('should return the first tile in the list if no default is found', () => {
    const noDefaultTileLayerElementList = [{ dataset: { tile: 'EsriWorldImagery' } }];
    expect(getDefaultHyperleafletTile(noDefaultTileLayerElementList)).toEqual(TILE_LAYERS.EsriWorldImagery);
  });

  it('should return the OpenStreetMap tile if the list is empty', () => {
    expect(getDefaultHyperleafletTile([])).toEqual(TILE_LAYERS.OpenStreetMap);
  });

  it('should return null if no tiles are found', () => {
    const noTileLayerElementList = [{ dataset: { foo: 'bar' } }];
    expect(getDefaultHyperleafletTile(noTileLayerElementList)).toEqual(TILE_LAYERS.OpenStreetMap);
  });
});
