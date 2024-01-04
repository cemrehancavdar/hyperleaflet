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

    if (extension.addNode && typeof extension.addNode === 'function') {
      this.addNode.push((node) => extension.addNode(node));
    }

    if (extension.removeNode && typeof extension.removeNode === 'function') {
      this.removeNode.push((node) => extension.removeNode(node));
    }

    if (extension.changeNode && typeof extension.changeNode === 'function') {
      this.changeNode.push((node) => extension.changeNode(node));
    }

    // If the extension has a custom onNodeAdded hook, add it to the list
    if (extension.beforeNodeAdd && typeof extension.beforeNodeAdd === 'function') {
      this.beforeNodeAdd.push((node) => extension.beforeNodeAdd(node));
    }

    if (extension.afterNodeAdd && typeof extension.afterNodeAdd === 'function') {
      this.afterNodeAdd.push(extension.afterNodeAdd);
    }

    if (extension.beforeNodeRemove && typeof extension.beforeNodeRemove === 'function') {
      this.beforeNodeRemove.push(extension.beforeNodeRemove);
    }

    if (extension.afterNodeRemove && typeof extension.afterNodeRemove === 'function') {
      this.afterNodeRemove.push(extension.afterNodeRemove);
    }

    if (extension.beforeNodeChange && typeof extension.beforeNodeChange === 'function') {
      this.beforeNodeChange.push(extension.beforeNodeChange);
    }

    if (extension.afterNodeChange && typeof extension.afterNodeChange === 'function') {
      this.afterNodeChange.push(extension.afterNodeChange);
    }
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
};

Hyperleaflet.addGeometryType = (type, customGeometryType) => {
  Geometry.addType(type, customGeometryType);
};

Hyperleaflet.options = Config.options;
