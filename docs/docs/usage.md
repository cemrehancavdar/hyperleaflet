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
Valid values: none <br>

`#!css data-tms`
: Indicates that the tile layer is a TMS (Tiled Map Service) layer. This is only necessary if using a custom tile layer that is in TMS format.<br>
Valid values: true/false. Default: false

??? info "Primary Tile"

    When no tile layer is specified, the primary tile layer for a map is [Open Street Map (OSM)](https://www.openstreetmap.org/){:target="\_blank"} by default.
    However, if one or more layers are specified, the first one listed will be the primary tile layer unless data-default-tile is specified for a different layer.
    In that case, the layer specified with data-default-tile will be set as the default tile layer.
