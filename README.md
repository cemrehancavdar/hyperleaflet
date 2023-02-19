## Hyperleaflet <🍃/> - An HTML-based Leaflet Library

[![Hyperleaflet]](https://user-images.githubusercontent.com/50503448/217046480-e997b33b-fddc-4c6d-af5e-18a6f4899928.mp4)



### Introduction

Hyperleaflet is a library that allows you to use the popular Leaflet library with just HTML attributes as an HTMX extension. With Hyperleaflet, you can interact with Leaflet maps without writing a single line of JavaScript.

### Motivation

HTMX is a powerful tool that aims to bring modern web development to the HTML level. With Hyperleaflet, HTMX extends its reach to interactive mapping, making it possible to interact with Leaflet maps without the need for any JavaScript code.

### How does it work?

Hyperleaflet uses HTML dataset attributes as inputs. For example:

    <div id="map" class="map" data-center="39.73, 39.99" data-zoom="5">
        <div data-tile="EsriWorldImagery" data-max-zoom="19" data-min-zoom="5" data-default></div>
        <div data-tile="OpenStreetMap"></div>
    </div>

The data-center attribute in the first div element means that the Leaflet map will be centered on the specified latitude and longitude location.

### Showing Data
Hyperleaflet listens to HTML elements marked with hx-ext="leaflet":

    <table hx-ext="leaflet" >
        <tr data-id="1" data-geometry="39.97,32.85">
            <td>39.97</td>
            <td>32.85</td>
            <td>Ankara</td>
        </tr>
        ...
    </table>

Every HTML element tagged with data-id and data-geometry will be added to the Leaflet map as a point marker. This allows you to easily display data on the map.

Hyperleaflet will also listen for changes triggered by HTMX events and dynamically update the Leaflet map accordingly.

Note: data-center, data-zoom, data-max-zoom, data-tile, etc. will be documented in future releases.

### What is cooking?

Hyperleaflet will be constantly evolving. 
We're working on adding new features and functionality.

With the help of hyperscript interactions, we aim to enhance the library with features like map interaction on click, data interaction on click, and the ability to retrieve map click coordinates to input elements.

 Additionally, we are exploring the possibility of adding other geometry types to the library.

 We're working towards version 1.0 and will be publishing a roadmap to outline our plans. However, we're not afraid to experiment and try new things on the way. We welcome feedback and suggestions from the HTMX and Leaflet communities.
