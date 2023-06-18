## Installing

Hyperleaflet is browser-oriented library. To install simply add the following `#!html <script>` tag to your HTML document:

```html
<script
  src="https://www.unpkg.com/hyperleaflet"
  integrity="sha384-hJcYnhFwc9+OUe4q7GsQz3cYn5tXKOzO6pl/wjSc2FKofcAfN/nsQg5Il+jCiFN+"
  crossorigin="anonymous"
></script>
```

### Adding Hyperleaflet to Project

Hyperleaflet is built on top of Leaflet, so you must include Leaflet in your project first. Refer to the Leaflet Quick Start guide [here](https://leafletjs.com/examples/quick-start/) to learn how to add Leaflet to your project.

Once you have Leaflet included, add the Hyperleaflet script tag to your HTML document. Make sure to include the defer attribute in the script tag to ensure it runs after the document has finished parsing.

??? warning "Don't forget to style your map"

    Make sure to add a minimum height to the container element that defines your Leaflet map, otherwise it may not appear in your document.

    ```css
    #map { 
      height: 500px;
      width: 500px;
       }
    ```

## Creating Hyperleaflet Map

All you need to do is add a div element with the id "map" to your HTML document, and a Leaflet map will be rendered automatically.

```html
<div id="map"></div>
```

### Handle with Data Attributes

Hyperleaflet leverages Leaflet's functionality by reading predefined data-\* attributes, such as `data-center` and `data-geometry`, to handle map rendering and other features.

##### Map Attributes
Map attributes define the characteristics of a map, including the tile layer, zoom level, center point, and default tile. 

```html
<div
  id="map"
  data-center="[38.5, 37.0]"
  data-zoom="5"
  data-min-zoom="4"
  data-max-zoom="11"
>
  ...
</div>
```

`#!css data-center`

: The center point of the map.<br>
Valid values: [latitude, longitude]. <br>

`#!css data-zoom`
: The zoom level of the map.<br>
Valid values: integer 1-18. <br>

`#!css data-min-zoom`
: The minimum zoom level of the map. <br>
Valid values: integer 1-18.<br>

`#!css data-max-zoom`
: The maximum zoom level of the map. <br>
Valid values: integer 1-18.<br>

`#!css data-reverse-order-all`
:  If present, all geometries added will be expected longitude, latitude (as geojson)  <br>
Hyperleaflet by default takes all geometries as latitude, longitude (as leaflet). <br>
[Further reading](https://macwright.com/lonlat/){:target="_blank"} on coordinate orders.

##### Tile Layers Attributes

```html
<div id="map" ...>
  <div
    data-tile="EsriWorldImagery"
    data-max-zoom="19"
    data-min-zoom="5"
    data-default-tile
  ></div>
  <div data-tile="OpenStreetMap"></div>
  <div
    data-tile="OpenTopoMap"
    data-tile-url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
  ></div>
  <div
    data-tile="ExampleTmsTile"
    data-tile-url="http://example.com/{z}/{x}/{y}.png"
    data-tms="true"
  ></div>
</div>
```

`#!css data-tile`
: The tile layer to be displayed on the map.<br>
Valid values: string, one of: "OpenStreetMap", "EsriWorldImagery", or the custom tile layer name.
If a custom tile layer is used, it can be defined using data-tile-url.


`#!css data-tile-url`
: The URL template for the custom tile layer. The placeholders {s}, {z}, {x}, and {y} will be replaced with the appropriate values for each tile.<br>
Valid format: string, URL template.

`#!css data-min-zoom`
: The minimum zoom level of the tile layer. <br>
Valid values: integer 1-18.<br>

`#!css data-max-zoom`
: The maximum zoom level of the tile layer. <br>
Valid values: integer 1-18.<br>

`#!css data-default-tile`
: If present, tile layer will be set as the default tile. <br>

`#!css data-tms`
: Indicates that the tile layer is a TMS (Tiled Map Service) layer. This is only necessary if using a custom tile layer that is in TMS format.<br>
Valid values: true/false. Default: false

`#!css data-reverse-order-all`
:  If present, the geometry added will be expected longitude, latitude (as geojson)  <br>
Hyperleaflet by default takes all geometries as latitude, longitude (as leaflet). <br>
[Further reading](https://macwright.com/lonlat/){:target="_blank"} on coordinate orders.

??? info "Primary Tile"

    When no tile layer is specified, the primary tile layer for a map is [Open Street Map (OSM)](https://www.openstreetmap.org/){:target="\_blank"} by default.
    However, if one or more layers are specified, the first one listed will be the primary tile layer unless data-default-tile is specified for a different layer.
    In that case, the layer specified with data-default-tile will be set as the default tile layer.

##### Geometry Attributes

The "data-hyperleaflet-source" attribute is used to specify the data source for the map, including the type of geometry and the coordinates for each feature.

``` html
<div data-hyperleaflet-source>
  <span
    data-id="1"
    data-geometry-type="Point"
    data-geometry="[38.5, 37.0]"
  ></span>
  <span
    data-id="2"
    data-geometry-type="LineString"
    data-geometry="[[32.7782,38.5250],[39.9032,39.6290],[41.2462,38.9089]]"
  ></span>
  <span
    data-id="3"
    data-geometry-type="Polygon"
    data-geometry="[[[35.6105693392152,40.23301476976525],[35.6105693392152,38.233456796364635],[40.0710185579654,38.233456796364635],[40.0710185579654,40.23301476976525],[35.6105693392152,40.23301476976525]]]"
  ></span>
</div>
```
`#!css data-hyperleaflet-source`
: Identifies the container element that holds the geometry data.<br>

`#!css data-id`
: Identifies each feature by its unique ID.<br>
Valid format: string or number.<br>

`#!css data-geometry-type`
: Identifies the type of geometry for each feature. <br>
Valid values: string: [ Point, LineString, Polygon ].<br>

`#!css data-geometry`
: Specifies the geometry data for each feature. <br>
Valid format: array of coordinates for Point and LineString, array of arrays of coordinates for Polygon.

`#!css data-geometry-display`

: The data-geometry-display attribute is used to control the display of geometries in a HTML element. It can take one of two valid options: <br><br>
   `#!css json`: Removes the data-geometry attributes from the containing elements and creates a new script tag with application/json type that contains the geometries in a GeoJSON-like syntax.
   ``` html 
    <div data-hyperleaflet-source data-geometry-display="json">
      <!-- Elements with data-geometry attributes here -->
    </div>
   ```
   A new `#!html <script type="application/json" data-testid="json">` element will be genereated with removed geometry attributes and corresponding data-id's and atteached to end of document.
   ``` html 
    <script type="application/json" data-testid="json">{
    "1": {
      "type": "Point",
      "coordinates": [
        38.5,
        37
      ]
      },
      ...
    }
    </script>
   ``` 
   `#!css remove`: Removes the data-geometry attributes from the containing elements.
   ``` html 
    <div data-hyperleaflet-source data-geometry-display="remove">
      <!-- Elements with data-geometry attributes here -->
    </div>
   ```

??? info "Why do data-geometry-display exists"

    When using only points, data-geometry can be a simple and convenient way to include geometry information in HTML. However, as more complex geometries are added, the HTML can quickly become cluttered with lengthy geometry representations.

    The data-geometry-display attribute addresses this by providing two options. The remove option removes the geometry attributes from the HTML entirely, which can make it cleaner and easier to read in browser dev tools. However, it also removes the ability to check the coordinates of the geometry directly in the HTML.

    The json option extracts the geometries to a newly created script tag with a type of application/json, which allows you to inspect the geometries as a JSON object. This can be useful if you need to verify or debug the geometry data.

    **TL;DR**: Long geometries got you down? Use data-geometry-display to clean up your HTML and make it more manageable. <br>
    remove: remove data-geometry attributes <br>
    json: remove them and add to end of the document <br>

### Event Handling
  Hyperleaflet provides an event system for interacting with the map and geometries. It sends custom events to the **window** object, which can be listened to and handled by JavaScript. We recommend using either [_hyperscript](https://hyperscript.org/){:target="_blank"} or [alpine.js](https://alpinejs.dev/){:target="_blank"} etc. to handle the events. The custom events contain a **detail** object with useful attributes, such as the clicked point on the map.

  Events use the **`target:event`** syntax, separated by a colon.
#### Hyperleaflet Events

`#!css hyperleaflet:ready`
: Triggered when hyperleaflet successfuly initialized <br>
  Event detail attributes <br>
  <span style="color: var(--md-code-hl-keyword-color)">zoom</span>:  the current zoom level, in the form: number <br>
  <span style="color: var(--md-code-hl-keyword-color)">center</span>: the geographic coordinates of the center of the map, in the form { lat: number, lng: number } <br>
  <span style="color: var(--md-code-hl-keyword-color)">bbox</span>: the bounding box of the map, in the form { min: { lat: number, lng: number }, max: { lat: number, lng: number } } <br>
  <span style="color: var(--md-code-hl-keyword-color)">bboxString</span>: the string representation of the bounding box in the format "minLng,minLat,maxLng,maxLat"

  ```js title="Example"
    window.addEventListener('map:move', (e) => {
      const { zoom, center, bbox, bboxString } = e.detail;
      console.log(`Map zoom at level ${zoom}`);
      console.log(`Centered at (${center.lat}, ${center.lng})`);
      console.log(`Bounded by (${bbox.min.lat}, ${bbox.min.lng}) and (${bbox.max.lat}, ${bbox.max.lng})`);
      console.log(`Bounding box string: ${bboxString}`);
    });
  ```

#### Map Events

`#!css map:click`

: Triggered when the user clicks on the map. <br>
  Event detail attributes <br>
  <span style="color: var(--md-code-hl-keyword-color)">point</span>: the geographic coordinates of the clicked point, in the form: { lat: number, lng: number } <br>

  ```js title="Example"
    window.addEventListener('map:click', (event) => {
      const { point } = event.detail;
      console.log(`Map clicked at: (${point.lat}, ${point.lng})`);
    });
  ```

`#!css map:zoom`

: Triggered when the map's zoom level changes. <br>
  Event detail attributes <br>
  <span style="color: var(--md-code-hl-keyword-color)">zoom</span>: the new zoom level, in the form: number<br>
  <span style="color: var(--md-code-hl-keyword-color)">center</span>: the geographic coordinates of the center of the map, in the form: { lat: number, lng: number } <br>
  <span style="color: var(--md-code-hl-keyword-color)">bbox</span>: the bounding box of the map, in the form: { min: { lat: number, lng: number }, max: { lat: number, lng: number } } <br>
  <span style="color: var(--md-code-hl-keyword-color)">bboxString</span>: the string representation of the bounding box in the format "minLng,minLat,maxLng,maxLat"

  ```js title="Example"
    window.addEventListener('map:zoom', (e) => {
      const { zoom, center, bbox, bboxString } = e.detail;
      console.log(`Map zoomed to level ${zoom}`);
      console.log(`Centered at (${center.lat}, ${center.lng})`);
      console.log(`Bounded by (${bbox.min.lat}, ${bbox.min.lng}) and (${bbox.max.lat}, ${bbox.max.lng})`);
      console.log(`Bounding box string: ${bboxString}`);
    });
  ```

`#!css map:move`

: Triggered when the user moves the map. <br>
  Event detail attributes <br>
  <span style="color: var(--md-code-hl-keyword-color)">zoom</span>:  the current zoom level, in the form: number <br>
  <span style="color: var(--md-code-hl-keyword-color)">center</span>: the geographic coordinates of the center of the map, in the form { lat: number, lng: number } <br>
  <span style="color: var(--md-code-hl-keyword-color)">bbox</span>: the bounding box of the map, in the form { min: { lat: number, lng: number }, max: { lat: number, lng: number } } <br>
  <span style="color: var(--md-code-hl-keyword-color)">bboxString</span>: the string representation of the bounding box in the format "minLng,minLat,maxLng,maxLat"

  ```js title="Example"
    window.addEventListener('map:move', (e) => {
      const { zoom, center, bbox, bboxString } = e.detail;
      console.log(`Map zoom at level ${zoom}`);
      console.log(`Centered at (${center.lat}, ${center.lng})`);
      console.log(`Bounded by (${bbox.min.lat}, ${bbox.min.lng}) and (${bbox.max.lat}, ${bbox.max.lng})`);
      console.log(`Bounding box string: ${bboxString}`);
    });
  ```

#### Geometry Events

`#!css geometry:click`

: Triggered when the user clicks on a geometry. <br>
  Event detail attributes <br>
  <span style="color: var(--md-code-hl-keyword-color)">clickedPoint</span>: the geographic coordinates of the clicked point, in the form { lat: number, lng: number }<br>
  <span style="color: var(--md-code-hl-keyword-color)">geometry</span>: the geographic coordinates of the geometry, in the form { lat: number, lng: number } or list of { lat: number, lng: number }  <br>
  <span style="color: var(--md-code-hl-keyword-color)">bbox</span>: the bounding box of the map, in the form: { min: { lat: number, lng: number }, max: { lat: number, lng: number } } <br>
  <span style="color: var(--md-code-hl-keyword-color)">rowId</span>: the unique identifier of the geometry, which is stored in the 'data-id' attribute, in the form of string

  ```js title="Example"
    window.addEventListener('geometry:click', (e) => {
      const { clickedPoint, geometry, rowId } = e.detail;
      console.log(`Clicked on row with ID ${rowId}`);
      console.log(`Geometry: ${JSON.stringify(geometry)}`);
      console.log(`Clicked at (${clickedPoint.lat}, ${clickedPoint.lng})`);
    });
  ```