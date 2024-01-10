import hyperChangeDetection from '../Hyperchange/hyperchange';

import { Map_ } from '../Map/map';
import { createGeometryHandler } from './hyperleafletGeometryHandler';
import { sendHyperleafletReady } from './events';
import { Geometry } from '../Geometry/geometry';
import { Layers } from '../Layers/layers';
import { TileLayers } from '../Layers';
import { Config } from '../config';

const HYPERLEAFLET_DATA_SOURCE = '[data-hyperleaflet-source]';

export const Hyperleaflet = {
  beforeNodeAdd: [],
  afterNodeAdd: [],
  beforeNodeRemove: [],
  afterNodeRemove: [],
  beforeNodeChange: [],
  afterNodeChange: [],
  addNode: [],
  removeNode: [],
  changeNode: [],

  initialize(mapContainer) {
    this.map = Map_.create(mapContainer);
    this.initializeLayerControl(mapContainer, this.map);
    this.initializeHyperleafletDataSource();
    sendHyperleafletReady(this.map);
  },

  addExtension(extension) {
    if (extension.layer) {
      Layers.control.addOverlay(extension.layer);
    }

    const functionNames = [
      'addNode',
      'removeNode',
      'changeNode',
      'beforeNodeAdd',
      'afterNodeAdd',
      'beforeNodeRemove',
      'afterNodeRemove',
      'beforeNodeChange',
      'afterNodeChange',
    ];

    functionNames.forEach((functionName) => {
      if (extension[functionName] && typeof extension[functionName] === 'function') {
        this[functionName].push((node) => extension[functionName](node));
      }
    });
  },

  initializeHyperleafletDataSource() {
    const hyperleafletDataSource = document.querySelector(HYPERLEAFLET_DATA_SOURCE);

    if (!hyperleafletDataSource) return;

    const { addNodeToHyperleaflet, deleteNodeFromHyperleaflet, changeNodeInHyperleaflet } = createGeometryHandler(
      this.map,
      Layers,
    );

    this.map.whenReady(() => {
      const nodes = hyperleafletDataSource.querySelectorAll('[data-id]');
      nodes.forEach((node) => {
        this.beforeNodeAdd.forEach((hook) => hook(node));
        if (node.dataset.hyperleafletExtension) {
          this.addNode.forEach((hook) => hook(node));
        } else {
          addNodeToHyperleaflet(node);
        }
        this.afterNodeAdd.forEach((hook) => hook(node));
      });
    });

    hyperChangeDetection.observe({
      targetSelector: HYPERLEAFLET_DATA_SOURCE,
      uniqueAttribute: 'data-id',
      attributeFilter: ['data-geometry'],
    });

    hyperChangeDetection.subscribe(HYPERLEAFLET_DATA_SOURCE, 'node_adds', (nodes) => {
      nodes.forEach((node) => {
        this.beforeNodeAdd.forEach((hook) => hook(node));
        if (node.dataset.hyperleafletExtension) {
          this.addNode.forEach((hook) => hook(node));
        } else {
          addNodeToHyperleaflet(node);
        }
        this.afterNodeAdd.forEach((hook) => hook(node));
      });
    });

    hyperChangeDetection.subscribe(HYPERLEAFLET_DATA_SOURCE, 'node_removes', (nodes) => {
      nodes.forEach((node) => {
        this.beforeNodeRemove.forEach((hook) => hook(node));
        if (node.dataset.hyperleafletExtension) {
          this.removeNode.forEach((hook) => hook(node));
        } else {
          deleteNodeFromHyperleaflet(node);
        }
        this.beforeNodeRemove.forEach((hook) => hook(node));
      });
    });

    hyperChangeDetection.subscribe(HYPERLEAFLET_DATA_SOURCE, 'node_changes', (changes) => {
      changes.forEach((change) => {
        this.afterNodeChange.forEach((hook) => hook(change));
        if (change.dataset.hyperleafletExtension) {
          this.changeNode.forEach((hook) => hook(change));
        } else {
          changeNodeInHyperleaflet(change);
        }
        this.afterNodeChange.forEach((hook) => hook(change));
      });
    });
  },

  initializeLayerControl(mapContainer) {
    const tileLayerElementList = mapContainer.querySelectorAll('[data-tile]');
    const { defaultTile, tiles } = TileLayers.nodesToTiles(tileLayerElementList);

    const layerControl = Layers.control;
    layerControl.addTo(this.map);

    tiles.forEach(({ name, tile }) => {
      Layers.addBaseLayer(tile, name);
    });

    defaultTile.addTo(this.map);
  },

  getZoom() {
    return this.map.getZoom();
  },

  setZoom(zoom) {
    this.map.setZoom(zoom);
  },
  getCenter() {
    return this.map.getCenter();
  },
  fitBounds(bounds) {
    this.map.fitBounds(bounds);
  },
  getBounds() {
    return this.map.getBounds();
  },
  getBBoxString() {
    return this.map.getBounds().toBBoxString();
  },
  panTo(center) {
    this.map.panTo(center);
  },
  fltTo(center, zoom = undefined) {
    zoom = zoom || this.map.getZoom();
    this.map.flyTo(center, zoom);
  },
  flyToBounds(bounds) {
    this.map.flyToBounds(bounds);
  },
};

Hyperleaflet.addGeometryType = (type, customGeometryType) => {
  Geometry.addType(type, customGeometryType);
};

Hyperleaflet.options = Config.options;
