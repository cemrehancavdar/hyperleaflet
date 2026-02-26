# Usage

## Installation

Hyperleaflet requires Leaflet. Add both scripts to your HTML:

```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://www.unpkg.com/hyperleaflet"></script>
```

Make sure your map container has a size:

```css
#map { height: 100vh; }
```

## Map

Add a `div` with `id="map"` and hyperleaflet initializes automatically on `DOMContentLoaded`.

```html
<div id="map" data-center="[38.5, 37.0]" data-zoom="5">
  <div data-tile="OpenStreetMap" data-default-tile></div>
</div>
```

### Map Attributes

| Attribute | Description | Default |
|---|---|---|
| `data-center` | `[lat, lng]` center point | `[0, 0]` |
| `data-zoom` | Initial zoom level (1-18) | `1` |
| `data-min-zoom` | Minimum zoom level | `0` |
| `data-max-zoom` | Maximum zoom level | `18` |
| `data-reverse-order-all` | If present, all coordinates are `[lng, lat]` (GeoJSON order) | lat,lng |
| `data-map-config` | CSS selector pointing to another element with map config attributes | self |

## Tile Layers

Child elements inside the map div define tile layers:

```html
<div id="map" data-center="[38.5, 37.0]" data-zoom="5">
  <div data-tile="EsriWorldImagery" data-default-tile></div>
  <div data-tile="OpenStreetMap"></div>
  <div data-tile="OpenTopoMap"
       data-tile-url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"></div>
</div>
```

### Tile Attributes

| Attribute | Description |
|---|---|
| `data-tile` | Tile layer name. Built-in: `OpenStreetMap`, `EsriWorldImagery`. Any other name requires `data-tile-url`. |
| `data-tile-url` | URL template for custom tile layers. Placeholders: `{s}`, `{z}`, `{x}`, `{y}`. |
| `data-default-tile` | If present, this tile is the default. Otherwise the first tile listed is used. |
| `data-tms` | Set to `"true"` for TMS tile layers. |
| `data-min-zoom` | Tile layer min zoom. |
| `data-max-zoom` | Tile layer max zoom. |

When no tile is specified, OpenStreetMap is used by default. A layer control is always added to the map.

## Geometries

Mark a container with `data-hyperleaflet-source`. Child elements with `data-id` become Leaflet layers.

```html
<div data-hyperleaflet-source style="display:none">
  <span data-id="1"
        data-geometry-type="Point"
        data-geometry="[38.5, 37.0]"
        data-popup="Hello!"></span>

  <span data-id="2"
        data-geometry-type="CircleMarker"
        data-geometry="[39.0, 35.0]"
        data-color="red"
        data-radius="8"
        data-fill-opacity="0.6"></span>

  <span data-id="3"
        data-geometry-type="LineString"
        data-geometry="[[32.78,38.52],[39.90,39.63]]"></span>

  <span data-id="4"
        data-geometry-type="Polygon"
        data-geometry="[[[35.6,40.2],[35.6,38.2],[40.0,38.2],[40.0,40.2],[35.6,40.2]]]"></span>
</div>
```

### Geometry Attributes

| Attribute | Description |
|---|---|
| `data-id` | Unique identifier (required). Used for O(1) layer lookup. |
| `data-geometry-type` | `Point`, `CircleMarker`, `LineString`, or `Polygon`. |
| `data-geometry` | JSON coordinates. Format depends on type. |
| `data-popup` | HTML string bound as a popup. |
| `data-tooltip` | HTML string bound as a tooltip. |
| `data-layer-name` | Optional. Groups geometry into a named overlay layer (togglable in layer control). |
| `data-reverse-order` | If present on the element, coordinates are `[lng, lat]`. |

### Inline Styles

CircleMarker, LineString, and Polygon accept Leaflet Path options as `data-*` attributes:

| Attribute | Type | Example |
|---|---|---|
| `data-color` | string | `"#ef4444"` |
| `data-fill-color` | string | `"#f97316"` |
| `data-weight` | number | `"2"` |
| `data-opacity` | number | `"0.8"` |
| `data-fill-opacity` | number | `"0.5"` |
| `data-radius` | number | `"10"` (CircleMarker only) |
| `data-dash-array` | string | `"5 10"` |
| `data-dash-offset` | number | `"3"` |
| `data-line-cap` | string | `"round"` |
| `data-line-join` | string | `"round"` |
| `data-fill` | boolean | `"true"` / `"false"` |
| `data-stroke` | boolean | `"true"` / `"false"` |
| `data-class-name` | string | `"my-layer"` |

You can also define named style presets via JavaScript config and reference them with `data-style="presetName"`. Inline attributes override presets.

## Reactivity

Hyperleaflet watches the `data-hyperleaflet-source` container for DOM changes via MutationObserver:

- **Add** an element with `data-id` → marker appears on the map
- **Remove** an element → marker is removed
- **Change** `data-geometry` attribute → marker moves

This makes it work seamlessly with HTMX, Turbo, or any library that swaps HTML:

```html
<div data-hyperleaflet-source
     hx-get="/markers"
     hx-trigger="map:move from:window delay:300ms"
     hx-swap="innerHTML">
</div>
```

## Events

Hyperleaflet dispatches custom events on `window` (configurable). Use `addEventListener` or pair with HTMX / Surreal.js / Alpine.js.

### hyperleaflet:ready

Fired when hyperleaflet has initialized and the map is ready.

```js
window.addEventListener('hyperleaflet:ready', (e) => {
  const { zoom, center, bbox, bboxString } = e.detail;
});
```

### map:click

Fired when the user clicks the map.

```js
window.addEventListener('map:click', (e) => {
  const { point } = e.detail; // { lat, lng }
});
```

### map:move, map:zoom

Fired on map pan/zoom. Both include `zoom`, `center`, `bbox`, `bboxString` in `e.detail`.

```js
window.addEventListener('map:move', (e) => {
  const { zoom, center, bboxString } = e.detail;
});
```

### geometry:click

Fired when a geometry is clicked.

```js
window.addEventListener('geometry:click', (e) => {
  const { id, clickedPoint, geometry } = e.detail;
});
```

### Other Map Events

These can be enabled via JavaScript config: `map:dblclick`, `map:mousedown`, `map:mouseover`, `map:mouseout`, `map:mousemove`, `map:contextmenu`, `map:preclick`, `map:zoomstart`, `map:zoomend`, `map:movestart`, `map:moveend`.

## JavaScript API

Hyperleaflet is available as `window.hyperleaflet`.

```js
// Map control
hyperleaflet.getZoom()
hyperleaflet.setZoom(10)
hyperleaflet.getCenter()          // { lat, lng }
hyperleaflet.getBounds()          // Leaflet LatLngBounds
hyperleaflet.getBBoxString()      // "west,south,east,north"
hyperleaflet.panTo([lat, lng])
hyperleaflet.flyTo([lat, lng], zoom)
hyperleaflet.flyToBounds(bounds)
hyperleaflet.fitBounds(bounds)

// Geometry lookup
hyperleaflet.getLayer(id)         // Leaflet layer or null
hyperleaflet.openPopup(id)        // opens popup for geometry with data-id
hyperleaflet.closePopup(id)       // closes popup

// Extend
hyperleaflet.addGeometryType('mytype', { create, update, convert })
```

## Configuration

Override defaults before the map initializes:

```html
<script>
  hyperleaflet.config.options = {
    reverseCoordinateOrder: true,
    events: {
      target: 'document',    // 'window' (default), 'document', or 'hyperleaflet'
      map: { dblclick: true, mousemove: true },
      geometry: { click: false },
    },
    styles: {
      circlemarker: {
        danger: { color: '#ef4444', fillColor: '#fca5a5', radius: 8 },
        info:   { color: '#3b82f6', fillColor: '#93c5fd', radius: 6 },
      },
    },
  };
</script>
```

Then reference presets in HTML: `<span data-style="danger" ...>`.

Options are deep-merged, so you only need to specify what you want to change.

## SPA Support

If `#map` doesn't exist at `DOMContentLoaded` (e.g. client-side routing), hyperleaflet sets up a MutationObserver on `document.body` and initializes when it appears.
