## Installing

Hyperleaflet is browser-oriented library. To install simply add the following `#!html <script>` tag to your HTML document:

```html
<script
  defer
  src="https://www.unpkg.com/hyperleaflet@0.2.3"
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
    #map { height: 180px; }
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
  data-center="38.5, 37.0"
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
    data-geometry="[38.5,37.0]"
  ></span>
  <span
    data-id="2"
    data-geometry-type="LineString"
    data-geometry="[[32.77822034494639,38.525007119850045],[39.90320643125176,39.62905366797489],[41.246286762679176,38.90892858721929]]"
  ></span>
  <span
    data-id="3"
    data-geometry-type="Polygon"
    data-geometry="[[[35.6105693392152,40.23301476976525],[35.6105693392152,38.233456796364635],[40.0710185579654,38.233456796364635],[40.0710185579654,40.23301476976525],[35.6105693392152,40.23301476976525]]]"
  ></span>
</div>
```
`#!css data-hyperleaflet-source`
: Identifies the container elem`nt that holds the geoJSON data.<br>

`#!css data-id`
: Identifies each feature by its unique ID.<br>
Valid format: string or number.<br>

`#!css data-geometry-type`
: Identifies the type of geometry for each feature. <br>
Valid values: string: [ Point, LineString, Polygon ].<br>

`#!css data-geometry`
: Specifies the geometry data for each feature. <br>
Valid format: array of coordinates for Point and LineString, array of arrays of coordinates for Polygon.