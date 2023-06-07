const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
const query2 = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson";

const fetchData = async (url) => {
  const response = await d3.json(url);
  return response.features;
};

const getColor = (magnitude) => {
  const r = 0;
  const g = 255;
  const b = Math.floor(255 - 80 * magnitude);
  return `rgb(${r}, ${g}, ${b})`;
};

const createPopupContent = (feature) => {
  return `<h3>${feature.properties.place}</h3>
          <hr>
          <p>${new Date(feature.properties.time)}</p>
          <hr>
          <p>Magnitude: ${feature.properties.mag}</p>`;
};

const createFeatures = (earthquakeData) => {
  const earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: (feature, layer) => layer.bindPopup(createPopupContent(feature)),
    pointToLayer: (feature, latlng) => {
      const geojsonMarkerOptions = {
        radius: 4 * feature.properties.mag,
        fillColor: getColor(feature.properties.mag),
        color: "black",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      };
      return L.circleMarker(latlng, geojsonMarkerOptions);
    }
  });
  createMap(earthquakes);
};

const createMap = (earthquakes) => {
  const streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ." +
    "T6YbdDixkOBWH_k9GbS8JQ");

  const baseMaps = {
    "Street Map": streetmap
  };

  const overlayMaps = {
    Earthquakes: earthquakes
  };

  const myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  const legend = L.control({position: 'bottomright'});
  
  legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
    grades = [0, 1, 2, 3, 4, 5, 6, 7, 8],
    labels = [];

    div.innerHTML+='Magnitude<br><hr>'
  
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
          '<i style="background:' + getColor(grades[i] + 1) + '">&nbsp&nbsp&nbsp&nbsp</i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };

  legend.addTo(myMap);
};

fetchData(queryUrl).then(createFeatures);
