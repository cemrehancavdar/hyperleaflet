# Hyperleaflet

Leaflet maps driven entirely by HTML attributes. No JavaScript required.

## Quick Start

```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://www.unpkg.com/hyperleaflet"></script>

<div id="map" style="height:100vh" data-center="[39.73, 39.99]" data-zoom="5">
  <div data-tile="OpenStreetMap" data-default-tile></div>
</div>

<div data-hyperleaflet-source style="display:none">
  <span data-id="ankara"
        data-geometry-type="Point"
        data-geometry="[39.97, 32.85]"
        data-popup="Ankara, Turkey"></span>
  <span data-id="quake"
        data-geometry-type="CircleMarker"
        data-geometry="[38.5, 37.0]"
        data-color="#ef4444"
        data-radius="10"
        data-fill-opacity="0.6"
        data-popup="M5.2 Earthquake"></span>
</div>
```

That's it. A map with a marker and a styled circle, popups included, zero JavaScript.

## Features

- **Declarative** -- map, tiles, geometries, styles all via `data-*` attributes
- **Reactive** -- add/remove/change DOM elements and the map updates automatically (MutationObserver)
- **HTMX-friendly** -- `innerHTML` swaps just work, pair with `hx-trigger="map:move from:window"`
- **Geometry types** -- Point, CircleMarker, LineString, Polygon
- **Inline styles** -- `data-color`, `data-radius`, `data-fill-opacity`, etc.
- **JS API** -- `hyperleaflet.flyTo()`, `hyperleaflet.openPopup(id)`, `hyperleaflet.getBBoxString()`, etc.
- **Events** -- `hyperleaflet:ready`, `map:click`, `map:move`, `map:zoom`, `geometry:click`
- **SPA support** -- auto-initializes when `#map` appears in the DOM

## Demo

**[Earthquake Explorer](https://hyperleaflet-earthquakes.fly.dev/)** -- 81,000 earthquakes from USGS, filterable by time, magnitude, and map bounds. Built with FastAPI, HTMX, and hyperleaflet. ([source](https://github.com/cemrehancavdar/hyperleaflet-earthquakes))

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
