let map;
let vehicleMarkers = {};
let routeLines = {};

const cityCoords = {
  "Zurique": [47.3769, 8.5417], "Genebra": [46.2044, 6.1432], "Lausana": [46.5197, 6.6324],
  "Basileia": [47.5596, 7.5886], "Berna": [46.9481, 7.4474], "Uster": [47.3475, 8.7207],
  "Berlim": [52.52, 13.405], "Munique": [48.1351, 11.582], "Hamburgo": [53.5511, 9.9937],
  "Frankfurt": [50.1109, 8.6821], "Colónia": [50.9375, 6.9603],
  "Paris": [48.8566, 2.3522], "Marselha": [43.2965, 5.3698], "Lyon": [45.75, 4.85],
  "Toulouse": [43.6047, 1.4442], "Nice": [43.7102, 7.262],
  "Madrid": [40.4168, -3.7038], "Barcelona": [41.3851, 2.1734], "Valência": [39.4699, -0.3763],
  "Sevilha": [37.3891, -5.9845], "Bilbau": [43.263, -2.935],
  "Lisboa": [38.7169, -9.1399], "Porto": [41.1579, -8.6291], "Coimbra": [40.2033, -8.4103],
  "Braga": [41.5454, -8.4265], "Faro": [37.0194, -7.9304]
};

const icons = {
  'Camião': L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1995/1995520.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -12]
  }),
  'Carrinha': L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2554/2554974.png',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -12]
  })
};

function setup() {
  if (map) {
    map.remove();
    map = null;
  }

  const cidadeInicial = game?.sede ?? "Zurique";
  const coords = cityCoords[cidadeInicial] || [47.3769, 8.5417];

  map = L.map("map").setView(coords, 6);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  for (const cidade in cityCoords) {
    L.circleMarker(cityCoords[cidade], {
      radius: 6,
      color: "#1e88e5",
      fillColor: "#42a5f5",
      fillOpacity: 0.8
    }).addTo(map).bindTooltip(cidade, { permanent: false, direction: 'top' });
  }
}

function draw() {
  if (!game || !map) return;

  // Limpar rotas e marcadores anteriores
  Object.values(vehicleMarkers).forEach(m => m.remove());
  Object.values(routeLines).forEach(r => r.remove());
  vehicleMarkers = {};
  routeLines = {};

  game.vehicles.forEach(vehicle => {
    const entregas = vehicle.entregas;
    if (!entregas || entregas.length === 0) return;

    const atual = entregas[0];
    const { fromCoords, toCoords, originalTime, remainingTime } = atual;
    if (!fromCoords || !toCoords) return;

    const progress = 1 - (remainingTime / originalTime);
    const lat = lerp(fromCoords.lat, toCoords.lat, progress);
    const lng = lerp(fromCoords.lng, toCoords.lng, progress);

    const key = `v_${vehicle.id}`;

    const linha = L.polyline([[fromCoords.lat, fromCoords.lng], [toCoords.lat, toCoords.lng]], {
      color: "#ff9800", weight: 4, dashArray: "6, 6"
    }).addTo(map);
    routeLines[key] = linha;

    const icon = icons[vehicle.type] || icons['Camião'];
    const marker = L.marker([lat, lng], { icon }).addTo(map).bindPopup(`${vehicle.name}<br>📍 ${vehicle.status}`);
    vehicleMarkers[key] = marker;
  });
}

function lerp(start, end, amt) {
  return start + (end - start) * amt;
}