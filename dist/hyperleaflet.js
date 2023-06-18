!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t(require("leaflet")):"function"==typeof define&&define.amd?define(["leaflet"],t):(e||self).hyperleaflet=t(e.leaflet)}(this,function(e){var t={OpenStreetMap:e.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}),EsriWorldImagery:e.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{attribution:"Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"})};function o(e,t){var o=e.getBounds(),r=o.getSouthWest(),n=o.getNorthEast(),i=o.toBBoxString();return new CustomEvent(t,{detail:{zoom:e.getZoom(),center:e.getCenter(),bbox:{min:r,max:n},bboxString:i}})}function r(o){var r,n,i,a=o.dataset,l=a.tile,d=a.tileUrl,c=a.minZoom,u=a.maxZoom;if(d){var s=new e.TileLayer(d,{minZoom:(i=void 0===(n={minZoom:c,maxZoom:u,tms:"true"===a.tms})?{}:n).minZoom||0,maxZoom:i.maxZoom||18,tms:!!i.tms});t[(r={name:l,tile:s}).name]?console.warn("Tile layer "+r.name+" already exists. Skipping."):t[r.name]=r.tile}var p=t[l];return p?(p.options.minZoom=c,p.options.maxZoom=u,{tile:p,name:l}):(console.warn(l+" is not in: \n"+Object.keys(t).join("\n")),null)}function n(e,t){void 0===t&&(t=!1);try{var o=JSON.parse(e);return t?function(e){return e.reverse()}(o):o}catch(e){return[0,0]}}var i,a,l,d={reverseOrderAll:!1};function c(e){e.removeAttribute("data-geometry")}function u(){return u=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var o=arguments[t];for(var r in o)Object.prototype.hasOwnProperty.call(o,r)&&(e[r]=o[r])}return e},u.apply(this,arguments)}function s(e,t){e.on("click",function(o){var r=new CustomEvent("geometry:click",{detail:{clickedPoint:o.latlng,geometry:e.getLatLngs(),rowId:t}});window.dispatchEvent(r)})}function p(e,t){var o,r,n=Object.values(t._layers),i=[],a=[];function l(e){e.forEach(function(e){1===e.nodeType&&e.matches("[data-id]")&&i.push(e),e.childNodes.length>0&&l(e.childNodes)})}function d(e){e.forEach(function(e){1===e.nodeType&&e.matches("[data-id]")&&a.push(e),e.childNodes.length>0&&d(e.childNodes)})}e.forEach(function(e){"childList"===e.type&&(l(e.addedNodes),d(e.removedNodes))});var c=null!=(o=a.filter(function(e){return!i.some(function(t){return t.dataset.id===e.dataset.id})}))?o:[];return{addedNodes:null!=(r=i.filter(function(e){return!n.some(function(t){return t.hlID===e.dataset.id})}))?r:[],removedNodes:c}}return i=function(){var i=!1;function a(){var a=document.querySelector("#map");if(a&&!i){i=!0,void 0!==a.dataset.reverseOrderAll&&(d.reverseOrderAll=!0);var l=function(t){var r,i=t.dataset,a=i.zoom,l=i.minZoom,c=i.maxZoom,u={center:n(i.center,d.reverseOrderAll),zoom:a||1},s=e.map(t,{center:u.center,zoom:u.zoom,minZoom:l||0,maxZoom:c||18});return(r=s).on("click",function(e){var t=new CustomEvent("map:click",{detail:{point:e.latlng}});window.dispatchEvent(t)}),r.whenReady(function(){var e=o(r,"map:load");window.dispatchEvent(e)}),r.on("zoomend",function(){var e=o(r,"map:zoom");window.dispatchEvent(e)}),r.on("move",function(){var e=o(r,"map:move");window.dispatchEvent(e)}),r}(a),m=function(o){var n,i=Array.from(o),a=i.map(r).filter(Boolean),l=function(e){var o=e.find(function(e){return"defaultTile"in e.dataset});return o&&o.dataset.tile in t?t[o.dataset.tile]:e.length&&e[0].dataset.tile in t?t[e[0].dataset.tile]:t.OpenStreetMap}(i);return{defaultHyperleafletTile:l,tileController:(n=a).length?e.control.layers(Object.fromEntries(n.map(function(e){return[e.name,e.tile]}))):null}}(a.querySelectorAll("[data-tile]")),f=m.defaultHyperleafletTile,v=m.tileController;v&&v.addTo(l),f.addTo(l),function(t){var o=document.querySelector("[data-hyperleaflet-source]");if(o){var r=o.dataset.geometryDisplay||"none",n={};if("json"===r){var i=function(){var e=document.createElement("script");e.type="application/json",e.setAttribute("data-testid","json"),e.innerText="{}",document.body.appendChild(e);var t=JSON.parse(e.text);return{addToGeometryObject:function(o){var r=o.dataset,n=r.id,i=r.geometry,a=r.geometryType;o.removeAttribute("data-geometry"),t[n]={type:a,coordinates:JSON.parse(i)},e.text=JSON.stringify(t,null,2)},removeFromGeometryObject:function(o){delete t[o.dataset.id],e.text=JSON.stringify(t,null,2)}}}();n={addCallback:i.addToGeometryObject,removeCallback:i.removeFromGeometryObject}}else"remove"===r&&(n={addCallback:c,removeCallback:function(){}});var a=function(t,o){var r=o.addCallback,n=void 0===r?function(){}:r,i=o.removeCallback,a=void 0===i?function(){}:i;return{addNoteListToHyperleaflet:function(o){o.forEach(function(o){(function(t,o){var r=t.dataset,n=r.id;if(Object.values(o._layers).find(function(e){return e.hlID===n}))console.error("%c"+n,"color:red","already exists",t);else{var i,a,l,c,p,m,f,v,y=(a=(i=u({},r)).popup,l=i.tooltip,c=i.geometryType,p=i.id,m=i.reverseOrder,f=JSON.parse(i.geometry),v=d.reverseOrderAll,function(t){return function(o,r){switch(t){case"Point":return function(t,o){var r,n,i=o.reverseOrderAll||void 0!==o.reverseOrder?[].concat(t).reverse():t,a=e.marker(i);return o.popup&&a.bindPopup(o.popup),o.tooltip&&a.bindTooltip(o.tooltip),n=o.id,(r=a).on("click",function(e){var t=new CustomEvent("geometry:click",{detail:{clickedPoint:e.latlng,geometry:r.getLatLng(),rowId:n}});window.dispatchEvent(t)}),a}(o,r);case"LineString":return function(t,o){var r=o.reverseOrderAll||void 0!==o.reverseOrder?e.GeoJSON.coordsToLatLngs(t,0):t,n=e.polyline(r);return o.popup&&n.bindPopup(o.popup),o.tooltip&&n.bindTooltip(o.tooltip),s(n,o.id),n}(o,r);case"Polygon":return function(t,o){var r=o.reverseOrderAll||void 0!==o.reverseOrder?e.GeoJSON.coordsToLatLngs(t,1):t,n=e.polygon(r);return o.popup&&n.bindPopup(o.popup),o.tooltip&&n.bindTooltip(o.tooltip),s(n,o.id),n}(o,r);default:return console.warn(t+" is not supported"),null}}}(c)(f,{popup:a,tooltip:l,id:p,reverseOrderAll:v,reverseOrder:m}));y.hlID=n,y.addTo(o)}})(o,t),n(o)})},removeNodeListToHyperleaflet:function(e){e.forEach(function(e){!function(e,t){var o=e.dataset.id,r=Object.values(t._layers).find(function(e){return e.hlID===o});null==r||r.remove()}(e,t),a(e)})}}}(t,n),l=a.addNoteListToHyperleaflet,m=a.removeNodeListToHyperleaflet;t.whenReady(function(){var e=o.querySelectorAll("[data-id]");l(e)}),new MutationObserver(function(e){var o=p(e,t),r=o.removedNodes;l(o.addedNodes),m(r)}).observe(o,{childList:!0,subtree:!0,attributeFilter:["data-id"]})}}(l),window.hyperleaflet={map:l},function(e){var t=o(e,"hyperleaflet:ready");window.dispatchEvent(t)}(l)}}return{initMap:a,observeMap:function(){new MutationObserver(function(){document.querySelector("#map")?a():i&&(i=!1,delete window.hyperleaflet)}).observe(document.documentElement,{childList:!0,subtree:!0})}}}(),a=i.initMap,l=i.observeMap,void document.addEventListener("DOMContentLoaded",function(){a(),l()})});
//# sourceMappingURL=hyperleaflet.js.map
