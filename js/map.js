// Mapa global acessível de qualquer ficheiro
window.map = null;

const mapCenter = [47.35, 8.72]; // Uster, Suíça

const vanIcon = L.icon({
  iconUrl: 'images/van_icon.png',
  iconSize: [35, 35],
  iconAnchor: [17, 17],
});

const truckIcon = L.icon({
  iconUrl: 'images/truck_icon.png',
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});
const hqIcon = L.icon({
    iconUrl: 'images/hq_icon.png',
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -20]
});
  

function initMap(companyName) {
  window.map = L.map('map', {
    center: mapCenter,
    zoom: 13,
    zoomControl: true,         // Ativa zoom
    dragging: true,            // Ativa arrastar
    scrollWheelZoom: true,
    doubleClickZoom: true,
    boxZoom: true,
    keyboard: true,
    tap: true,
    touchZoom: true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(window.map);

  // Sede da empresa
  L.marker([47.3615, 8.7169], { icon: hqIcon })
  .addTo(window.map)
  .bindPopup(`<b>${companyName}</b><br>Sede da empresa`);

}

function moveVanOnMap(van, iconType = 'van') {
    if (!van.route || van.route.length === 0) return;
  
    if (van.marker) window.map.removeLayer(van.marker);
    if (van.polyline) window.map.removeLayer(van.polyline);
  
    const icon = iconType === 'truck' ? truckIcon : vanIcon;
    van.marker = L.marker(van.route[0], { icon }).addTo(window.map);
  
    van.polyline = L.polyline(van.route, {
      color: van.color || 'blue',
      weight: 3
    }).addTo(window.map);
  
    let currentStep = 0;
    const speed = 10000;        // ← Mais lento (2s por segmento)
    const intervalRate = 25;   // ← Atualizações mais suaves
  
    function animateStep() {
      if (currentStep >= van.route.length - 1) {
        van.cargo = 0;
        van.route = [];
        refreshVans();
        return;
      }
  
      const start = van.route[currentStep];
      const end = van.route[currentStep + 1];
      let t = 0;
  
      const interval = setInterval(() => {
        t += intervalRate / speed;
        if (t >= 1) t = 1;
  
        const lat = start[0] + (end[0] - start[0]) * t;
        const lng = start[1] + (end[1] - start[1]) * t;
        van.marker.setLatLng([lat, lng]);
  
        if (t === 1) {
          clearInterval(interval);
          currentStep++;
  
          // Espera 1.5 segundos no ponto de entrega
          setTimeout(animateStep, 1500);
        }
      }, intervalRate);
    }
  
    animateStep();
}
  
  
