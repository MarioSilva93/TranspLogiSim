function carregarMiniMapaDashboard() {
  const div = document.getElementById("miniMapa");
  if (!div || div._leaflet_id) return;

  const miniMap = L.map("miniMapa", {
    zoomControl: false,
    dragging: false,
    scrollWheelZoom: false,
    attributionControl: false
  }).setView([46.8182, 8.2275], 6);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 10,
    minZoom: 5
  }).addTo(miniMap);

  // Cidades
  if (typeof cityCoords !== "undefined") {
    for (const nome in cityCoords) {
      const [lat, lng] = cityCoords[nome];
      if (lat && lng) {
        L.circleMarker([lat, lng], {
          radius: 4,
          color: "#00bcd4"
        })
          .bindTooltip(nome)
          .addTo(miniMap);
      }
    }
  }

  // Veículos
  if (game?.vehicles) {
    game.vehicles.forEach(v => {
      if (!v.location || !v.location.lat || !v.location.lng) return;

      const icon = L.icon({
        iconUrl: v.type === "Camião" ? "img/truck.png" : "img/van.png",
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      L.marker([v.location.lat, v.location.lng], { icon }).addTo(miniMap);
    });
  }
}
