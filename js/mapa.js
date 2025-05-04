let map;
let vehicleMarkers = {};
let routeLines = {};
let mapInitialized = false;

const cityCoords = {
  Uster: [47.347, 8.720],
  Zurique: [47.3769, 8.5417],
  Genebra: [46.2044, 6.1432],
  Berna: [46.9481, 7.4474],
  Lausana: [46.5197, 6.6323],
  Basileia: [47.5596, 7.5886]
};

// Ícones reais
const icons = {
  'Camião': L.icon({
    iconUrl: 'https://imagensempng.com.br/wp-content/uploads/2021/05/Caminhao-frete-Png-1024x1024.png',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  }),
  'Carrinha': L.icon({
    iconUrl: 'https://e7.pngegg.com/pngimages/186/795/png-clipart-van-car-computer-icons-professional-services-compact-car-van-thumbnail.png',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  })
};

function setup() {
  if (mapInitialized) return; // evita repetir
  mapInitialized = true;

  setTimeout(() => {
    map = L.map('map').setView([46.8, 8.3], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map);

    for (let city in cityCoords) {
      const coord = cityCoords[city];
      L.circleMarker(coord, {
        radius: 6,
        color: "#1e88e5",
        fillColor: "#42a5f5",
        fillOpacity: 0.8
      }).addTo(map).bindTooltip(city, { permanent: true, direction: 'right' });
    }

    map.invalidateSize();
  }, 300);
}

function draw() {
  if (!game || !map) return;

  game.vehicles.forEach(vehicle => {
    let lat, lng;
    const key = `v_${vehicle.id}`;

    if (vehicle.delivery) {
      const { fromCoords, toCoords, originalTime, remainingTime } = vehicle.delivery;
      const progress = 1 - remainingTime / originalTime;
      lat = lerp(fromCoords.lat, toCoords.lat, progress);
      lng = lerp(fromCoords.lng, toCoords.lng, progress);

      // Desenha linha apenas uma vez
      if (!routeLines[key]) {
        routeLines[key] = L.polyline(
          [[fromCoords.lat, fromCoords.lng], [toCoords.lat, toCoords.lng]],
          { color: 'orange', weight: 3, dashArray: '5, 5' }
        ).addTo(map);
      }
    } else {
      const baseCoord = cityCoords[vehicle.location];
      lat = baseCoord?.[0] || 0;
      lng = baseCoord?.[1] || 0;

      if (routeLines[key]) {
        map.removeLayer(routeLines[key]);
        delete routeLines[key];
      }
    }

    if (!vehicleMarkers[key]) {
      const tipo = vehicle.type.trim();
      const marker = L.marker([lat, lng], {
        icon: icons[tipo] || icons['Camião']
      }).addTo(map).bindTooltip(vehicle.name, { permanent: false });
      vehicleMarkers[key] = marker;
    } else {
      vehicleMarkers[key].setLatLng([lat, lng]);
    }
  });
}

function lerp(start, end, amt) {
  return start + (end - start) * amt;
}
