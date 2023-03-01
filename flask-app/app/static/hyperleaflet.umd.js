!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t(require("leaflet")):"function"==typeof define&&define.amd?define(["leaflet"],t):(e||self).hyperleaflet=t(e.leaflet)}(this,function(e){function t(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var o=/*#__PURE__*/t(e);function n(){return n=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var o=arguments[t];for(var n in o)Object.prototype.hasOwnProperty.call(o,n)&&(e[n]=o[n])}return e},n.apply(this,arguments)}function r(e,t){e.on("click",function(e){var o=new CustomEvent("pointclick",{detail:{point:e.latlng,rowId:t}});window.dispatchEvent(o)})}var a=new Map,i={OpenStreetMap:o.default.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}),EsriWorldImagery:o.default.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{attribution:"Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"})},l=document.createElement("script");l.type="application/json",l.setAttribute("data-testid","debug"),l.innerText="{}",document.body.appendChild(l);var d=JSON.parse(l.text);function u(e){var t=e.dataset,o=t.id,n=t.geometry,r=t.geometryType;e.removeAttribute("data-geometry"),d[o]={type:r,coordinates:JSON.parse(n)},l.text=JSON.stringify(d,null,2)}function p(e){delete d[e.dataset.id],l.text=JSON.stringify(d,null,2)}function c(e){e.removeAttribute("data-geometry")}return function(){if(void 0!==o.default){var e=document.querySelector("#map"),t=function(e){var t,n=e.dataset,r=n.center,a=n.zoom,i={center:null==r?void 0:r.split(","),zoom:a||1};return(t=o.default.map(e).setView(i.center,i.zoom)).on("click",function(e){var t=new CustomEvent("mapclick",{detail:{point:e.latlng}});window.dispatchEvent(t)}),t.on("zoomend",function(){var e=new CustomEvent("mapzoom",{detail:{zoom:t.getZoom(),center:t.getCenter(),bbox:t.getBounds()}});window.dispatchEvent(e)}),t.on("move",function(){var e=new CustomEvent("mapmove",{detail:{zoom:t.getZoom(),center:t.getCenter(),bbox:t.getBounds()}});window.dispatchEvent(e)}),t}(e),l=document.querySelector("[hyperleaflet]"),d=(h=e.querySelectorAll("[data-tile]"),{defaultHyperleafletTile:null!=(w=null==(T=(S=Array.from(h).map(function(e){var t=e.dataset,o=t.tile,n=t.maxZoom,r=i[o];return r?(r.options.minZoom=t.minZoom,r.options.maxZoom=n,{tile:r}):(console.warn(o+" is not in: \n"+Object.keys(i).join("\n")),null)}).filter(Boolean)).find(function(e){return e.isDefault}))?void 0:T.tile)?w:i.OpenStreetMap,tileController:S.length?o.default.control.layers(Object.fromEntries(S.map(function(e){return[e.tile.name,e.tile]}))):null}),s=d.defaultHyperleafletTile,f=d.tileController;f&&f.addTo(t),s.addTo(t);var m=l.dataset.geometryDisplay||"object",y={};"object"===m?y={addCallback:u,removeCallback:p}:"remove"===m&&(y={addCallback:c,removeCallback:function(){}});var v=function(e,t){var i=t.addCallback,l=void 0===i?function(){}:i,d=t.removeCallback,u=void 0===d?function(){}:d;return{addNoteListToHyperleaflet:function(t){t.forEach(function(t){1===t.nodeType&&t.matches("[data-id]")&&(function(e){var t=e.dataset,i=t.id;if(i in a)return console.error("%c"+i,"color:red","already exists",e),[];var l,d,u,p,c,s,f=(d=(l=n({},t)).popup,u=l.tooltip,p=l.geometryType,c=l.id,s=JSON.parse(l.geometry),function(e){return function(t,n){switch(e){case"Point":return function(e,t){var n=o.default.marker(e);return t.popup&&n.bindPopup(t.popup),t.tooltip&&n.bindTooltip(t.tooltip),r(n,t.id),n}(t,n);case"LineString":return function(e,t){var n=o.default.GeoJSON.coordsToLatLngs(e,1),a=o.default.polyline(n);return t.popup&&a.bindPopup(t.popup),t.tooltip&&a.bindTooltip(t.tooltip),r(a,t.id),a}(t,n);case"Polygon":return function(e,t){var n=o.default.GeoJSON.coordsToLatLngs(e,1),a=o.default.polygon(n);return t.popup&&a.bindPopup(t.popup),t.tooltip&&a.bindTooltip(t.tooltip),r(a,t.id),a}(t,n);default:return console.warn(e+" is not supported"),null}}}(p)(s,{popup:d,tooltip:u,id:c}));return a.set(i,f),[f]}(t)[0].addTo(e),l(t))})},removeNodeListToHyperleaflet:function(e){e.forEach(function(e){if(1===e.nodeType&&e.matches("[data-id]")){var t=function(e){var t=e.dataset.id,o=a.get(t);return a.delete(t),[o]}(e);t[0].remove(),u(e)}})}}}(t,y),b=v.addNoteListToHyperleaflet,g=v.removeNodeListToHyperleaflet;return t.whenReady(function(){var e=l.querySelectorAll("[data-id]");b(e)}),new MutationObserver(function(e){e.forEach(function(e){"childList"===e.type&&(b(e.addedNodes),g(e.removedNodes))})}).observe(l,{childList:!0,subtree:!0,attributeFilter:["data-id"]}),{map:t,addGeoJsonToMap:function(e){o.default.geoJSON(e).addTo(t)}}}var h,w,T,S;console.error("Hyperleaflet can not access Leaflet")}()});
//# sourceMappingURL=hyperleaflet.umd.js.map
