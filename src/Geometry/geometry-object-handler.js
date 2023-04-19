export default function geometryObjectHandler(){
  const geometryObjectElement = document.createElement('script');
  geometryObjectElement.type = 'application/json';
  geometryObjectElement.setAttribute('data-testid', 'json');
  geometryObjectElement.innerText = '{}';
  document.body.appendChild(geometryObjectElement);
  
  const geometryObject = JSON.parse(geometryObjectElement.text);
  const addToGeometryObject = (node) =>  {
    const { id, geometry, geometryType } = node.dataset;
    node.removeAttribute('data-geometry');
    geometryObject[id] = { type: geometryType, coordinates: JSON.parse(geometry) };
    geometryObjectElement.text = JSON.stringify(geometryObject, null, 2);
  }
  const removeFromGeometryObject = (node) => {
    const { id } = node.dataset;
    delete geometryObject[id];
    geometryObjectElement.text = JSON.stringify(geometryObject, null, 2);
  }
  return {addToGeometryObject, removeFromGeometryObject}
}
