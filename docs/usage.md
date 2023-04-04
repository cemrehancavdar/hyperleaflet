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
<div id="map" 
  data-center="38.5, 37.0"
  data-zoom="5"
  data-min-zoom="4"
  data-max-zoom="11">
  ...   
</div>
```

`#!css data-center`

: The center point of the map.<br>
 Valid format: latitude, longitude. <br>
<!-- `#!js data-center="38.5, 37.0"` -->

`#!css data-zoom`
: The zoom level of the map.<br>
Valid values: integer 1-18. <br>
<!-- `#!js data-zoom="5"` -->

`#!css data-min-zoom`
: The minimum zoom level of the map. <br>
Valid values: integer 1-18.<br>
<!-- `#!js data-min-zoom="4"` -->

`#!css data-max-zoom`:
: The maximum zoom level of the map. <br>
Valid values: integer 1-18.<br>
<!-- `#!js data-max-zoom="11"` -->

??? info "Your default basemap is OSM"

    [Open Street Map (OSM)](https://www.openstreetmap.org/){:target="_blank"} as the primary tile layer by default. However, users have the option to specify other tile layers that are further described below.
