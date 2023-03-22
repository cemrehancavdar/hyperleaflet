# Introduction 

![hyperleaflet](assets/hyperleaflet-github-with-leaf-background.png)

## What is hyperleaflet?
Hyperleaflet is a library that allows you to use the popular Leaflet library with just *HTML attributes*. With Hyperleaflet, you can interact with Leaflet maps without writing a single line of JavaScript.
It offers a wide range of capabilities by wrapping Leaflet's most useful features in an opinionated yet versatile way.

Hyperleaflet designed to be a user-friendly Leaflet library that simplifies the creation of interactive maps for web pages or server-rendered HTML pages. This makes it a great choice for developers who want to create custom maps for web applications that require server-side rendering.

### What is Leaflet?

Leaflet is a popular JavaScript library by [Vladimir Agafonkin](https://agafonkin.com/) used for creating interactive maps on web pages. Leaflet already has a powerful and intuitive API that makes it easy to work with and customize maps to your specific needs. 


## Sample

<div id="map" class="map" data-center="38.5, 37.0" data-zoom="5" style="width: inherit; height: 40vh; z-index: 1">
    <div data-tile="EsriWorldImagery" data-max-zoom="19" data-min-zoom="5" data-default-tile></div>
    <div data-tile="OpenStreetMap"></div>
        <div hyperleaflet>
            <span data-id="1" data-geometry="[41.0,39.72]" data-geometry-type="Point" data-popup="<h3>Trabzon</h3>"
                data-tooltip="<i>tooltip</i>" ></span>
            <span data-id="2" data-geometry="[39.97,32.85]" data-geometry-type="Point" data-popup="<h3>Ankara</h3>">
            </span>
        </div>
</div>





=== "İnitialize Map"

    ```html
    <div id="map" class="map" data-center="39.73, 39.99" data-zoom="5">   
    </div>
    ```

=== "Add Tiles"

    ```html hl_lines="2 3"
    <div id="map" class="map" data-center="39.73, 39.99" data-zoom="5">   
      <div data-tile="EsriWorldImagery" data-max-zoom="19" data-min-zoom="5" data-default-tile></div>
      <div data-tile="OpenStreetMap"></div>
    </div>
    ```

=== "Add Geometries"

    ```html hl_lines="4-9"
    <div id="map" class="map" data-center="39.73, 39.99" data-zoom="5">   
      <div data-tile="EsriWorldImagery" data-max-zoom="19" data-min-zoom="5" data-default-tile></div>
      <div data-tile="OpenStreetMap"></div>
          <div hyperleaflet>
            <span data-id="1" data-geometry="[41.0,39.72]" data-geometry-type="Point" data-popup="<h3>Trabzon</h3>"
              data-tooltip="1232" ></span>
            <span data-id="2" data-geometry="[39.97,32.85]" data-geometry-type="Point" data-popup="<h3>Ankara</h1>">
            </span>
          </div>
    </div>
    ```


## Commands

- `mkdocs new [dir-name]` - Create a `new` project.
- `mkdocs serve` - Start the live-reloading docs server.
- `mkdocs build` - Build the documentation site.
- `mkdocs -h` - Print help message and exit.
