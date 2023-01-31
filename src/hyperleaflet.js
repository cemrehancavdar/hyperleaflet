import L from "leaflet";
import { defineExtension, remove } from 'htmx.org';
import TILE_LAYERS from "./constants"

const hyperleaflet = (function hyperleaflet() {
    if (typeof L === "undefined") {
        console.error("Can't access Leaflet");
        return undefined;
    }



    const mapDiv = document.querySelector("#map");
    const tileLayerDivs = mapDiv.querySelectorAll("[data-tile]");

    const initalMapAttributes = {
        center: [0, 0],
        zoom: 1,
        tile: TILE_LAYERS.OpenStreetMap,
    };

    const { dataset } = mapDiv

    const center = dataset?.center.split(",") || initalMapAttributes.center.center;
    const zoom = dataset?.zoom || initalMapAttributes.zoom;
    let { tile } = initalMapAttributes

    const tiles = {};


    tileLayerDivs.forEach((tileLayer) => {
        const { dataset: tileLayerDataset } = tileLayer
        const tileLayerName = tileLayerDataset.tile;
        if (tileLayerName in TILE_LAYERS) {
            const tempTile = TILE_LAYERS[tileLayerName];
            tempTile.options.minZoom = tileLayerDataset.minZoom;
            tempTile.options.maxZoom = tileLayerDataset.maxZoom;
            tiles[tileLayerName] = tempTile;
            if ("default" in tileLayerDataset) {
                tile = tempTile;
            }
        } else {
            console.warn(`${tileLayerName} is not in: \n${Object.keys(TILE_LAYERS).join("\n")}`);
        }
    });

    const map = L.map(mapDiv).setView(center, zoom);

    if (Object.keys(tiles).length) {
        L.control.layers(tiles).addTo(map);
    }
    tile.addTo(map);




    const leafletObjects = {}
    const proxy = new Proxy(leafletObjects, {
        set(target, property, value) {
            const point = L.marker(value.split(",")).addTo(map)
            target[property] = point;
            return true;
        },
        deleteProperty(target, property) {
            target[property].remove()
            delete target[property]
            return true;
        }
    });

    const diff = (original, news) => {
        const originalList = Object.keys(original)
        const newsList = Object.keys(news)
        
        const adds = newsList.filter(item => !originalList.includes(item))
        const deletes = originalList.filter(item => !newsList.includes(item))

        return { adds, deletes }
    }

    const toLeaflet = (target) => {
        const rowNodeList = target.querySelectorAll("[data-id]")
        const rowList = Array.from(rowNodeList)
        const rowsObj = rowList.reduce((curr, next) => ({ ...curr, [next.dataset.id]: next.dataset.latlng }), {})
        const difference = diff(leafletObjects, rowsObj)
        difference.adds.forEach(row => { proxy[row] = rowsObj[row] })
        difference.deletes.forEach(row => { delete proxy[row] })

    }


    defineExtension('leaflet', {
        onEvent: (name) => {
            if (['htmx:afterProcessNode', 'htmx:afterOnLoad'].includes(name)) {
                const hyperleafTable = document.querySelector('[hx-ext=leaflet]')
                toLeaflet(hyperleafTable)
            }
        }
    })

    return { map };
})();

export default hyperleaflet;
