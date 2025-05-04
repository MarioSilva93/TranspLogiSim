let map;
let vehicleLayer = null;

const cityCoords = {
  "Zurique": [47.3769, 8.5417],
  "Genebra": [46.2044, 6.1432],
  "Lausana": [46.5197, 6.6323],
  "Basileia": [47.5596, 7.5886],
  "Berna": [46.9481, 7.4474],
  "Uster": [47.3475, 8.7207],

  "Berlim": [52.52, 13.405],
  "Munique": [48.1351, 11.582],
  "Hamburgo": [53.5511, 9.9937],
  "Frankfurt": [50.1109, 8.6821],
  "Colónia": [50.9375, 6.9603],

  "Paris": [48.8566, 2.3522],
  "Marselha": [43.2965, 5.3698],
  "Lyon": [45.75, 4.85],
  "Toulouse": [43.6047, 1.4442],
  "Nice": [43.7102, 7.262],

  "Madrid": [40.4168, -3.7038],
  "Barcelona": [41.3851, 2.1734],
  "Valência": [39.4699, -0.3763],
  "Sevilha": [37.3891, -5.9845],
  "Bilbau": [43.263, -2.935],

  "Lisboa": [38.7169, -9.1399],
  "Porto": [41.1579, -8.6291],
  "Coimbra": [40.2033, -8.4103],
  "Braga": [41.5454, -8.4265],
  "Faro": [37.0194, -7.9304]
};

function setup() {
  if (map) {
    map.remove(); // remove mapa anterior
    map = null;
  }

  map = L.map("map").setView([46.8, 8.33], 6);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  vehicleLayer = L.layerGroup().addTo(map);
}

function focarMapaNaCidade(nomeCidade) {
  const coords = cityCoords[nomeCidade];
  if (map && coords) {
    map.setView(coords, 10);

    L.circleMarker(coords, {
      radius: 8,
      color: "#4caf50",
      fillColor: "#81c784",
      fillOpacity: 0.8
    })
      .addTo(map)
      .bindPopup(`📍 Cidade-sede: ${nomeCidade}`)
      .openPopup();
  }
}

function atualizarMapa() {
  if (!map || !game || !game.vehicles) return;

  vehicleLayer.clearLayers();

  game.vehicles.forEach(vehicle => {
    if (vehicle.delivery) {
      const { fromCoords, toCoords } = vehicle.delivery;
      if (!fromCoords || !toCoords) return;

      const iconUrl = vehicle.type === "Carrinha" ? "img/van.png" : "img/truck.png";

      const customIcon = L.icon({
        iconUrl,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      L.marker(fromCoords, { icon: customIcon })
        .addTo(vehicleLayer)
        .bindPopup(`${vehicle.name}<br>Saída: ${vehicle.delivery.order.from}`);

      L.marker(toCoords)
        .addTo(vehicleLayer)
        .bindPopup(`Destino: ${vehicle.delivery.order.to}`);

      L.polyline([fromCoords, toCoords], { color: "orange" }).addTo(vehicleLayer);
    }
  });
}
