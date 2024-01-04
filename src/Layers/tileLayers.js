import * as L from 'leaflet';

export const TileLayers = {
  _tileLayers: {
    OpenStreetMap: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }),
    EsriWorldImagery: L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      },
    ),
  },
  _addTileLayer(name, { url, minZoom = 0, maxZoom = 18, tms } = {}) {
    if (this._tileLayers[name]) {
      return;
    }
    const newTileLayer = new L.TileLayer(url, { minZoom, maxZoom, tms: !!tms });
    this._tileLayers[name] = newTileLayer.tile;
  },

  _getDefaultHyperleafletTile(tileLayerElementList) {
    const defaultTileLayerElement = tileLayerElementList.find((t) => 'defaultTile' in t.dataset);
    if (defaultTileLayerElement && defaultTileLayerElement.dataset.tile in this._tileLayers) {
      return this._tileLayers[defaultTileLayerElement.dataset.tile];
    }
    if (tileLayerElementList.length && tileLayerElementList[0].dataset.tile in this._tileLayers) {
      return this._tileLayers[tileLayerElementList[0].dataset.tile];
    }
    return this._tileLayers.OpenStreetMap;
  },

  tiles: [],
  defaultTile: undefined,
  nodesToTiles(tileLayerElementNodeList) {
    const tileLayerElementList = Array.from(tileLayerElementNodeList);
    tileLayerElementList.forEach((tileLayerElement) => {
      const { tile } = tileLayerElement.dataset;

      if (!(tile in this._tileLayers)) {
        const { tileUrl, tms, minZoom, maxZoom } = tileLayerElement.dataset;
        this._addTileLayer(tile, { tileUrl, tms, minZoom, maxZoom });
      }
      this.tiles.push({ name: tile, tile: this._tileLayers[tile] });
    });

    this.defaultTile = this._getDefaultHyperleafletTile(tileLayerElementList);
    return {
      defaultTile: this.defaultTile,
      tiles: this.tiles,
    };
  },
};
