![hyperleaflet-github-with-map-background-black-white](https://user-images.githubusercontent.com/50503448/226453243-27619ebb-b323-4c51-be95-d01bf5b53545.png)

## An HTML-based Leaflet Library

### Introduction

Hyperleaflet is a library that allows you to use the popular Leaflet library with just HTML attributes.

### How does it work?

Hyperleaflet uses HTML dataset attributes as inputs. For example:
```html

    <div id="map" class="map" data-center="[39.73, 39.99]" data-zoom="5">
        <div data-tile="EsriWorldImagery" data-max-zoom="19" data-min-zoom="5" data-default></div>
        <div data-tile="OpenStreetMap"></div>
    </div>
```
The data-center attribute in the first div element means that the Leaflet map will be centered on the specified latitude and longitude location.

### Showing Data
Hyperleaflet listens to HTML elements marked with data-hyperleaflet-source":
```html
    <table data-hyperleaflet-source >
        <tr data-id="1" data-geometry="[32.85,39.97,]" data-geometry-type="Point">
            <td>39.97</td>
            <td>32.85</td>
            <td>Ankara</td>
        </tr>
        ...
    </table>
```
Every HTML element tagged with data-id and data-geometry will be added to the Leaflet map as a point marker. This allows you to easily display data on the map.

Hyperleaflet will also listen for changes in HTML and dynamically update the Leaflet map accordingly.


### What is cooking?

Hyperleaflet will be constantly evolving. 
We're working on adding new features and functionality.

With the help of hyperscript interactions, we aim to enhance the library with features like map interaction on click, data interaction on click, and the ability to retrieve map click coordinates to input elements.

 We're working towards version 1.0 and will be publishing a roadmap to outline our plans. However, we're not afraid to experiment and try new things on the way. We welcome feedback and suggestions from the all map loving communities.

 
[![Hyperleaflet]](https://user-images.githubusercontent.com/50503448/217046480-e997b33b-fddc-4c6d-af5e-18a6f4899928.mp4)

