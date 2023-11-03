!(function (e, t) {
  'object' == typeof exports && 'undefined' != typeof module
    ? (module.exports = t(require('leaflet')))
    : 'function' == typeof define && define.amd
    ? define(['leaflet'], t)
    : ((e || self).hyperleaflet = t(e.leaflet));
})(this, function (e) {
  var t = {
    OpenStreetMap: e.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }),
    EsriWorldImagery: e.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      },
    ),
  };
  function o(o) {
    var n,
      r,
      a,
      i = o.dataset,
      l = i.tile,
      d = i.tileUrl,
      p = i.minZoom,
      u = i.maxZoom;
    if (d) {
      var c = new e.TileLayer(d, {
        minZoom: (a = void 0 === (r = { minZoom: p, maxZoom: u, tms: 'true' === i.tms }) ? {} : r).minZoom || 0,
        maxZoom: a.maxZoom || 18,
        tms: !!a.tms,
      });
      t[(n = { name: l, tile: c }).name]
        ? console.warn('Tile layer ' + n.name + ' already exists. Skipping.')
        : (t[n.name] = n.tile);
    }
    var s = t[l];
    return s
      ? ((s.options.minZoom = p), (s.options.maxZoom = u), { tile: s, name: l })
      : (console.warn(l + ' is not in: \n' + Object.keys(t).join('\n')), null);
  }
  var n = document.createElement('script');
  (n.type = 'application/json'),
    n.setAttribute('data-testid', 'debug'),
    (n.innerText = '{}'),
    document.body.appendChild(n);
  var r = JSON.parse(n.text);
  function a(e) {
    var t = e.dataset,
      o = t.id,
      a = t.geometry,
      i = t.geometryType;
    e.removeAttribute('data-geometry'),
      (r[o] = { type: i, coordinates: JSON.parse(a) }),
      (n.text = JSON.stringify(r, null, 2));
  }
  function i(e) {
    delete r[e.dataset.id], (n.text = JSON.stringify(r, null, 2));
  }
  function l(e) {
    e.removeAttribute('data-geometry');
  }
  function d() {
    return (
      (d = Object.assign
        ? Object.assign.bind()
        : function (e) {
            for (var t = 1; t < arguments.length; t++) {
              var o = arguments[t];
              for (var n in o) Object.prototype.hasOwnProperty.call(o, n) && (e[n] = o[n]);
            }
            return e;
          }),
      d.apply(this, arguments)
    );
  }
  function p(e, t) {
    e.on('click', function () {
      var o = new CustomEvent('pointclick', { detail: { point: e.getLatLng(), rowId: t } });
      window.dispatchEvent(o);
    });
  }
  var u,
    c = new Map();
  return (
    (function (t) {
      var o = document.querySelector('[data-hyperleaflet-source]');
      if (o) {
        var n = o.dataset.geometryDisplay || 'object',
          r = {};
        'object' === n
          ? (r = { addCallback: a, removeCallback: i })
          : 'remove' === n && (r = { addCallback: l, removeCallback: function () {} });
        var u = (function (t, o) {
            var n = o.addCallback,
              r = void 0 === n ? function () {} : n,
              a = o.removeCallback,
              i = void 0 === a ? function () {} : a;
            return {
              addNoteListToHyperleaflet: function (o) {
                o.forEach(function (o) {
                  1 === o.nodeType &&
                    o.matches('[data-id]') &&
                    ((function (t) {
                      var o = t.dataset,
                        n = o.id;
                      if (n in c) return console.error('%c' + n, 'color:red', 'already exists', t), [];
                      var r,
                        a,
                        i,
                        l,
                        u,
                        s,
                        m =
                          ((a = (r = d({}, o)).popup),
                          (i = r.tooltip),
                          (l = r.geometryType),
                          (u = r.id),
                          (s = JSON.parse(r.geometry)),
                          (function (t) {
                            return function (o, n) {
                              switch (t) {
                                case 'Point':
                                  return (function (t, o) {
                                    var n = e.marker(t);
                                    return (
                                      o.popup && n.bindPopup(o.popup),
                                      o.tooltip && n.bindTooltip(o.tooltip),
                                      p(n, o.id),
                                      n
                                    );
                                  })(o, n);
                                case 'LineString':
                                  return (function (t, o) {
                                    var n = e.GeoJSON.coordsToLatLngs(t, 0),
                                      r = e.polyline(n);
                                    return (
                                      o.popup && r.bindPopup(o.popup),
                                      o.tooltip && r.bindTooltip(o.tooltip),
                                      p(r, o.id),
                                      r
                                    );
                                  })(o, n);
                                case 'Polygon':
                                  return (function (t, o) {
                                    var n = e.GeoJSON.coordsToLatLngs(t, 1),
                                      r = e.polygon(n);
                                    return (
                                      o.popup && r.bindPopup(o.popup),
                                      o.tooltip && r.bindTooltip(o.tooltip),
                                      p(r, o.id),
                                      r
                                    );
                                  })(o, n);
                                default:
                                  return console.warn(t + ' is not supported'), null;
                              }
                            };
                          })(l)(s, { popup: a, tooltip: i, id: u }));
                      return c.set(n, m), [m];
                    })(o)[0].addTo(t),
                    r(o));
                });
              },
              removeNodeListToHyperleaflet: function (e) {
                e.forEach(function (e) {
                  if (1 === e.nodeType && e.matches('[data-id]')) {
                    var t = (function (e) {
                      var t = e.dataset.id,
                        o = c.get(t);
                      return c.delete(t), [o];
                    })(e);
                    t[0].remove(), i(e);
                  }
                });
              },
            };
          })(t, r),
          s = u.addNoteListToHyperleaflet,
          m = u.removeNodeListToHyperleaflet;
        t.whenReady(function () {
          var e = o.querySelectorAll('[data-id]');
          s(e);
        }),
          new MutationObserver(function (e) {
            e.forEach(function (e) {
              'childList' === e.type && (s(e.addedNodes), m(e.removedNodes));
            });
          }).observe(o, { childList: !0, subtree: !0, attributeFilter: ['data-id'] });
      }
    })(
      (u = (function () {
        var n = document.querySelector('#map'),
          r = (function (t) {
            var o,
              n,
              r = t.dataset,
              a = r.center,
              i = r.zoom,
              l = r.minZoom,
              d = r.maxZoom,
              p = { center: null != (o = null == a ? void 0 : a.split(',')) ? o : [0, 0], zoom: i || 1 },
              u = e.map(t, { center: p.center, zoom: p.zoom, minZoom: l || 0, maxZoom: d || 18 });
            return (
              (n = u).on('click', function (e) {
                var t = new CustomEvent('mapclick', { detail: { point: e.latlng } });
                window.dispatchEvent(t);
              }),
              n.on('zoomend', function () {
                var e = new CustomEvent('mapzoom', {
                  detail: { zoom: n.getZoom(), center: n.getCenter(), bbox: n.getBounds() },
                });
                window.dispatchEvent(e);
              }),
              n.on('move', function () {
                var e = new CustomEvent('mapmove', {
                  detail: { zoom: n.getZoom(), center: n.getCenter(), bbox: n.getBounds() },
                });
                window.dispatchEvent(e);
              }),
              n
            );
          })(n),
          a = (function (n) {
            var r,
              a = Array.from(n),
              i = a.map(o).filter(Boolean),
              l = (function (e) {
                var o = e.find(function (e) {
                  return 'defaultTile' in e.dataset;
                });
                return o && o.dataset.tile in t
                  ? t[o.dataset.tile]
                  : e.length && e[0].dataset.tile in t
                  ? t[e[0].dataset.tile]
                  : t.OpenStreetMap;
              })(a);
            return {
              defaultHyperleafletTile: l,
              tileController: (r = i).length
                ? e.control.layers(
                    Object.fromEntries(
                      r.map(function (e) {
                        return [e.name, e.tile];
                      }),
                    ),
                  )
                : null,
            };
          })(n.querySelectorAll('[data-tile]')),
          i = a.defaultHyperleafletTile,
          l = a.tileController;
        return l && l.addTo(r), i.addTo(r), r;
      })()),
    ),
    {
      map: u,
      addGeoJsonToMap: function (t) {
        e.geoJSON(t).addTo(u);
      },
    }
  );
});
//# sourceMappingURL=index.js.map
