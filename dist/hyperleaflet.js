var e=require("leaflet"),t=require("htmx.org");function n(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var o=/*#__PURE__*/n(e);function r(){return r=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var o in n)Object.prototype.hasOwnProperty.call(n,o)&&(e[o]=n[o])}return e},r.apply(this,arguments)}var a={OpenStreetMap:o.default.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}),EsriWorldImagery:o.default.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{attribution:"Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"})},i=function(){if(void 0!==o.default){var e=document.querySelector("#map"),n=e.querySelectorAll("[data-tile]"),i={center:[0,0],zoom:1,tile:a.OpenStreetMap},l=e.dataset,c=(null==l?void 0:l.center.split(","))||i.center.center,d=(null==l?void 0:l.zoom)||i.zoom,u=i.tile,s={};n.forEach(function(e){var t=e.dataset,n=t.tile;if(n in a){var o=a[n];o.options.minZoom=t.minZoom,o.options.maxZoom=t.maxZoom,s[n]=o,"default"in t&&(u=o)}else console.warn(n+" is not in: \n"+Object.keys(a).join("\n"))});var m=o.default.map(e).setView(c,d);!function(e){e.on("click",function(e){var t=document.getElementById("map"),n=new CustomEvent("mapclick",{detail:{latlng:e.latlng}});t.dispatchEvent(n)}),e.on("zoomend",function(){var t=document.getElementById("map"),n=new CustomEvent("mapzoom",{detail:{zoom:e.getZoom()}});t.dispatchEvent(n)}),e.on("move",function(){var t=document.getElementById("map"),n=new CustomEvent("mapmove",{detail:{bbox:e.getBounds(),center:e.getCenter()}});t.dispatchEvent(n)})}(m),Object.keys(s).length&&o.default.control.layers(s).addTo(m),u.addTo(m);var f={},p=new Proxy(f,{set:function(e,t,n){var r=o.default.marker(n.split(",")).addTo(m);return function(e,t){e.on("click",function(e){var n=document.getElementById("map"),o=new CustomEvent("pointclick",{detail:{latlng:e.latlng,rowId:t}});n.dispatchEvent(o)})}(r,t),e[t]=r,!0},deleteProperty:function(e,t){return e[t].remove(),delete e[t],!0}});return t.defineExtension("leaflet",{onEvent:function(e){var t,n,o,a,i,l;["htmx:afterProcessNode","htmx:afterOnLoad"].includes(e)&&(a=document.querySelector("[hx-ext=leaflet]").querySelectorAll("[data-id]"),t=i=Array.from(a).reduce(function(e,t){var n;return r({},e,((n={})[t.dataset.id]=t.dataset.latlng,n))},{}),n=Object.keys(f),(l={adds:(o=Object.keys(t)).filter(function(e){return!n.includes(e)}),deletes:n.filter(function(e){return!o.includes(e)})}).adds.forEach(function(e){p[e]=i[e]}),l.deletes.forEach(function(e){delete p[e]}))}}),{map:m}}console.error("Hyperleaf can not access Leaflet")}();module.exports=i;
//# sourceMappingURL=hyperleaflet.js.map
