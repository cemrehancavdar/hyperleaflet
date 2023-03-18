# Hyperleaflet


<div id="map" class="map" data-center="39.73, 39.99" data-zoom="5" style="width: inherit; height: 40vh; z-index: 1">
    <div data-tile="EsriWorldImagery" data-max-zoom="19" data-min-zoom="5" data-default-tile></div>
    <div data-tile="OpenStreetMap"></div>
        <dl hyperleaflet>
            <data data-id="1" data-geometry="[41.0,39.72]" data-geometry-type="Point" data-popup="<h1>Trabzon<h1>"
                data-tooltip="1232" ></data>
            <data data-id="2" data-geometry="[39.97,32.85]" data-geometry-type="Point" data-popup="<h1>Ankara<h1>">
            </data>
        </dl>
</div>

```html
<div id="map" class="map" data-center="39.73, 39.99" data-zoom="5">
  <div data-tile="EsriWorldImagery" data-max-zoom="19" data-min-zoom="5" data-default-tile></div>
  <div data-tile="OpenStreetMap"></div>
      <dl hyperleaflet>
        <data data-id="1" data-geometry="[41.0,39.72]" data-geometry-type="Point" data-popup="<h1>Trabzon<h1>"
          data-tooltip="1232" ></data>
        <data data-id="2" data-geometry="[39.97,32.85]" data-geometry-type="Point" data-popup="<h1>Ankara<h1>">
        </data>
      </dl>
</div>
```


## Commands

- `mkdocs new [dir-name]` - Create a new project.
- `mkdocs serve` - Start the live-reloading docs server.
- `mkdocs build` - Build the documentation site.
- `mkdocs -h` - Print help message and exit.

## Project layout 

    mkdocs.yml    # The configuration file.
    docs/
        index.md  # The documentation homepage.
        ...       # Other markdown pages, images and other files.

