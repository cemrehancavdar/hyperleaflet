const hyperleafletConfig = {
  options: {
    reverseCoordinateOrder: false,
    events: {
      map: {
        target: 'window',
        click: true,
        zoom: true,
      },
      geometry: {
        target: 'window',
        click: true,
        add: true,
        change: true,
      },
      hyperleaflet: {
        ready: true,
      },
    },
    styles: {},
  },
};

export default hyperleafletConfig;
