## Hyperleaflet - An HTML-based Leaflet Library

### Introduction

Hyperleaflet is a library that allows you to use the popular Leaflet library with just HTML attributes as an HTMX extension. With Hyperleaflet, you can interact with Leaflet maps without writing a single line of JavaScript.

### motivation

HTMX is a powerful tool that aims to bring modern web development to the HTML level. With Hyperleaflet, HTMX extends its reach to interactive mapping, making it possible to interact with Leaflet maps without the need for any JavaScript code.

### How does it work?

Hyperleaflet uses HTML dataset attributes as inputs. For example:

    <div id="map" class="map" data-center="39.73, 39.99" data-zoom="5">
        <div data-tile="EsriWorldImagery" data-max-zoom="19" data-min-zoom="5" data-default></div>
        <div data-tile="OpenStreetMap"></div>
    </div>

The data-center attribute in the first div element means that the Leaflet map will be centered on the specified latitude and longitude location.
##### WIP
data-center, data-zoom, data-max-zoom, data-tile etc. will be documented.

### showing data
Hyperleaflet listens to HTML elements marked with hx-ext="leaflet":

    <table hx-ext="leaflet" >
        <tr data-id="1" data-latlng="39.97,32.85">
            <td>39.97</td>
            <td>32.85</td>
            <td>Ankara</td>
        </tr>
        ...
    </table>

Note: data-center, data-zoom, data-max-zoom, data-tile, etc. will be documented in future releases.