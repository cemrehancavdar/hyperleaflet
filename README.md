![hyperleaflet](docs/assets/hyperleaflet-github-with-leaf-background.png)

Leaflet maps driven entirely by HTML attributes. No JavaScript required.

https://user-images.githubusercontent.com/50503448/217046480-e997b33b-fddc-4c6d-af5e-18a6f4899928.mp4

## Show a map

```html
<div id="map" style="height:100vh" data-center="[39.73, 39.99]" data-zoom="5">
  <div data-tile="OpenStreetMap" data-default-tile></div>
</div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://www.unpkg.com/hyperleaflet"></script>
```

## Add markers

Any element with `data-id` inside a `data-hyperleaflet-source` container becomes a marker on the map:

```html
<table data-hyperleaflet-source>
  <tr data-id="1" data-geometry="[39.97, 32.85]" data-geometry-type="Point">
    <td>Ankara</td>
  </tr>
  <tr data-id="2" data-geometry="[41.01, 28.98]" data-geometry-type="Point">
    <td>Istanbul</td>
  </tr>
</table>
```

Your data is your markup. A `<table>`, a list of `<div>`s, anything — hyperleaflet doesn't care about the element type, just the `data-*` attributes.

## Style them

```html
<span data-id="quake"
      data-geometry-type="CircleMarker"
      data-geometry="[38.5, 37.0]"
      data-color="#ef4444"
      data-radius="10"
      data-fill-opacity="0.6"
      data-popup="<b>M5.2</b> Earthquake">
</span>
```

## It's reactive

Add, remove, or change elements in the DOM and the map updates automatically. This makes it work with HTMX, Turbo, or anything that swaps HTML:

```html
<div data-hyperleaflet-source
     hx-get="/markers"
     hx-trigger="map:move from:window delay:300ms"
     hx-swap="innerHTML">
</div>
```

Pan the map, HTMX fetches new markers, hyperleaflet puts them on the map. No glue code.

## Features

- **Geometry types** -- Point, CircleMarker, LineString, Polygon
- **Inline styles** -- `data-color`, `data-radius`, `data-fill-opacity`, `data-weight`, `data-dash-array`, etc.
- **Popups & tooltips** -- `data-popup`, `data-tooltip`
- **Layer groups** -- `data-layer-name` for togglable overlays
- **JS API** -- `hyperleaflet.flyTo()`, `hyperleaflet.openPopup(id)`, `hyperleaflet.getLayer(id)`, `hyperleaflet.getBBoxString()`
- **Events** -- `hyperleaflet:ready`, `map:click`, `map:move`, `map:zoom`, `geometry:click`
- **SPA support** -- auto-initializes when `#map` appears in the DOM
- **5 KB** gzipped

## Demo

**[Earthquake Explorer](https://hyperleaflet-earthquakes.fly.dev/)** -- 81,000 earthquakes from USGS, filterable by time, magnitude, and map bounds. Built with FastAPI, HTMX, and hyperleaflet. ([source](https://github.com/cemrehancavdar/hyperleaflet-earthquakes))

## Install

```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://www.unpkg.com/hyperleaflet"></script>
```

Or via npm:

```bash
npm install hyperleaflet
```

## Documentation

See [docs/usage.md](docs/usage.md) for the full reference.

## Development

```bash
npm install
npm run dev     # watch mode
npm run build   # produces dist/hyperleaflet.umd.js
npm test        # unit tests (vitest)
npm run e2e     # browser tests (playwright)
```

## License

MIT
