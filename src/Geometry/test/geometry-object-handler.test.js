// // @vitest-environment happy-dom
import { describe, expect, it, beforeEach } from 'vitest';
import geometryObjectHandler from '../geometry-object-handler';

describe('geometryObjectHandler', () => {
  beforeEach(() => {
    // Reset the document body before each test
    document.body.innerHTML = '';
  });

  it('adds an object to the geometry object', () => {
    // Arrange
    const { addToGeometryObject } = geometryObjectHandler();
    const node = document.createElement('div');
    node.dataset.id = '1';
    node.dataset.geometryType = 'Point';
    node.dataset.geometry = '[1, 2]';
    document.body.appendChild(node);

    // Act
    addToGeometryObject(node);

    // Assert
    const geometryObjectElement = document.querySelector('[data-testid="json"]');
    const geometryObject = JSON.parse(geometryObjectElement.innerText);
    expect(geometryObject).toEqual({
      '1': {
        type: 'Point',
        coordinates: [1, 2],
      },
    });
  });

  it('removes an object from the geometry object', () => {
    // Arrange
    const { addToGeometryObject, removeFromGeometryObject } = geometryObjectHandler();
    const node = document.createElement('div');
    node.dataset.id = '1';
    node.dataset.geometryType = 'Point';
    node.dataset.geometry = '[1, 2]';
    document.body.appendChild(node);
    addToGeometryObject(node);

    // Act
    removeFromGeometryObject(node);

    // Assert
    const geometryObjectElement = document.querySelector('[data-testid="json"]');
    const geometryObject = JSON.parse(geometryObjectElement.innerText);
    expect(geometryObject).toEqual({});
  });

  it('handles multiple objects in the geometry object', () => {
    // Arrange
    const { addToGeometryObject } = geometryObjectHandler();
    const node1 = document.createElement('div');
    node1.dataset.id = '1';
    node1.dataset.geometryType = 'Point';
    node1.dataset.geometry = '[1, 2]';
    document.body.appendChild(node1);

    const node2 = document.createElement('div');
    node2.dataset.id = '2';
    node2.dataset.geometryType = 'LineString';
    node2.dataset.geometry = '[[1, 2], [3, 4], [5, 6]]';
    document.body.appendChild(node2);

    // Act
    addToGeometryObject(node1);
    addToGeometryObject(node2);

    // Assert
    const geometryObjectElement = document.querySelector('[data-testid="json"]');
    const geometryObject = JSON.parse(geometryObjectElement.innerText);
    expect(geometryObject).toEqual({
      '1': {
        type: 'Point',
        coordinates: [1, 2],
      },
      '2': {
        type: 'LineString',
        coordinates: [[1, 2], [3, 4], [5, 6]],
      },
    });
  });
});
