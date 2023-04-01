## Installing

Hyperleaflet is browser-oriented library. To install simply add the following `#!html <script>` tag to your HTML document:

```html
<script defer src="https://www.unpkg.com/hyperleaflet@0.2.3" integrity="sha384-hJcYnhFwc9+OUe4q7GsQz3cYn5tXKOzO6pl/wjSc2FKofcAfN/nsQg5Il+jCiFN+" crossorigin="anonymous"></script>
```


## Adding Hyperleaflet to Project

Hyperleaflet is built on top of Leaflet, so you must include Leaflet in your project first. Refer to the Leaflet Quick Start guide [here](https://leafletjs.com/examples/quick-start/) to learn how to add Leaflet to your project.

Once you have Leaflet included, add the Hyperleaflet script tag to your HTML document. Make sure to include the defer attribute in the script tag to ensure it runs after the document has finished parsing.


??? warning "Don't forget to style your map"

    Make sure to add a minimum height to the container element that defines your Leaflet map, otherwise it may not appear in your document.

    ```css
    #map { height: 180px; }
    ```