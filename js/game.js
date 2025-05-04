let map;
let selectedVanIndex = null;
let vans = [
  { name: "Carrinha 1", fuel: 100, maintenance: 100, xp: 0, cargo: 0, maxLoad: 1000, route: [], marker: null },
  { name: "Carrinha 2", fuel: 100, maintenance: 100, xp: 0, cargo: 0, maxLoad: 1000, route: [], marker: null }
];

let deliveries = [];
const maxDeliveries = 25;
const deliveryLayerGroup = L.layerGroup();
const fuelStations = [
  [47.352, 8.715],
  [47.358, 8.722],
  [47.345, 8.710]
];
const repairShops = [
  [47.355, 8.719],
  [47.344, 8.712]
];
const distributionCenters = [
  [47.359, 8.714],
  [47.343, 8.725]
];

// Função para calcular o nível com base no XP
function getLevel(xp) {
    return Math.floor(xp / 100) + 1;
  }
  
  // Função para calcular o percentual de XP para a barra visual
  function getXPPercent(xp) {
    return Math.min((xp % 100), 100);
}
  
function init() {
  const player = sessionStorage.getItem("playerName");
  const company = sessionStorage.getItem("companyName");
  const difficulty = sessionStorage.getItem("difficulty") || "normal";

  document.getElementById("playerInfo").innerHTML = `Jogador: ${player}<br>Empresa: <strong>${company}</strong>`;

  map = L.map("map").setView([47.35, 8.72], 14);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Map data © OpenStreetMap contributors",
  }).addTo(map);

  deliveryLayerGroup.addTo(map);

  const depot = [47.3615, 8.7169];
  L.marker(depot, {
    icon: L.divIcon({ className: 'hq-icon', html: `<b>${company}</b>`, iconSize: [100, 20] })
  }).addTo(map).bindPopup("Sede da empresa");

  refreshVans();
  for (let i = 0; i < maxDeliveries; i++) addDelivery();
  placeFuelStations();
  placeRepairShops();
  placeCenters();
  setInterval(updateDeliveries, 10000);
}

function refreshVans() {
  const container = document.getElementById("vans");
  container.innerHTML = "";
  vans.forEach((van, index) => {
    const box = document.createElement("div");
    box.className = "van-box" + (index === selectedVanIndex ? " selected" : "");
    box.innerHTML = `
      <strong>${van.name}</strong><br>
      Combustível: ${van.fuel}%<br>
      Manutenção: ${van.maintenance}%<br>
      XP: ${van.xp} | Nível: ${getLevel(van.xp)}
      <div class="xp-bar">
        <div class="xp-fill" style="width:${getXPPercent(van.xp)}%"></div>
      </div>
    `;
    box.onclick = () => {
      selectedVanIndex = index;
      refreshVans();
    };
    container.appendChild(box);
  });
}

function generateName() {
  const nomes = ["Anna M.", "Lukas R.", "Clara K.", "Jonas S.", "Nina F.", "Pedro V.", "Laura W."];
  return nomes[Math.floor(Math.random() * nomes.length)];
}

function generateCoords() {
  const lat = 47.34 + Math.random() * 0.03;
  const lng = 8.70 + Math.random() * 0.03;
  return [lat, lng];
}

function addDelivery() {
  if (deliveries.length >= maxDeliveries) return;

  const name = generateName();
  const coords = generateCoords();
  const weight = Math.floor(Math.random() * 300) + 100;
  const marker = L.marker(coords).addTo(deliveryLayerGroup)
    .bindPopup(`<b>${name}</b><br>Peso: ${weight}kg<br><button onclick="addToRoute(${coords}, ${weight})">Adicionar à Rota</button>`);
  deliveries.push({ name, coords, weight, marker });

  updateDeliveryList();
}

function updateDeliveries() {
  while (deliveries.length > maxDeliveries) {
    const old = deliveries.shift();
    deliveryLayerGroup.removeLayer(old.marker);
  }
  for (let i = 0; i < 3; i++) addDelivery();
}

function updateDeliveryList() {
  const list = document.getElementById("deliveries");
  list.innerHTML = "";
  deliveries.forEach(d => {
    const li = document.createElement("li");
    li.textContent = d.name;
    list.appendChild(li);
  });
}

function addToRoute(lat, lng, weight) {
  if (selectedVanIndex === null) return alert("Seleciona uma carrinha primeiro.");
  const van = vans[selectedVanIndex];
  if ((van.cargo + weight) > van.maxLoad) {
    return alert("Carrinha sobrecarregada!");
  }
  van.cargo += weight;
  van.route.push([lat, lng]);
  L.polyline(van.route, { color: van.icon }).addTo(map);
}

function dispatchRoute() {
  if (selectedVanIndex === null) return;
  const van = vans[selectedVanIndex];
  if (!van.route.length) return;

  if (van.marker) map.removeLayer(van.marker);
  van.marker = L.marker(van.route[0]).addTo(map);
  let step = 0;

  function move() {
    if (step >= van.route.length) return;
    van.marker.setLatLng(van.route[step]);
    van.fuel -= 5;
    van.xp += 10;
    refreshVans();
    step++;
    setTimeout(move, 1200);
  }

  move();
}

function placeFuelStations() {
  fuelStations.forEach(coords => {
    L.marker(coords, { icon: L.divIcon({ className: 'fuel-icon', html: '⛽', iconSize: [20, 20] }) })
      .addTo(map)
      .bindPopup(`<b>Posto de combustível</b><br><button onclick="refuelVan()">Abastecer</button>`);
  });
}

function refuelVan() {
  if (selectedVanIndex === null) return alert("Seleciona uma carrinha!");
  vans[selectedVanIndex].fuel = 100;
  refreshVans();
}

function placeRepairShops() {
  repairShops.forEach(coords => {
    L.marker(coords, { icon: L.divIcon({ className: 'repair-icon', html: '🔧', iconSize: [20, 20] }) })
      .addTo(map)
      .bindPopup(`<b>Oficina</b><br><button onclick="repairVan()">Reparar Carrinha</button>`);
  });
}

function repairVan() {
  if (selectedVanIndex === null) return alert("Seleciona uma carrinha!");
  vans[selectedVanIndex].maintenance = 100;
  refreshVans();
}

function placeCenters() {
  distributionCenters.forEach(coords => {
    L.marker(coords, { icon: L.divIcon({ className: 'center-icon', html: '🏭', iconSize: [20, 20] }) })
      .addTo(map)
      .bindPopup(`<b>Centro de Distribuição</b><br>Reiniciar rota e carga<br><button onclick="resetVan()">Resetar Carrinha</button>`);
  });
}

function resetVan() {
  if (selectedVanIndex === null) return alert("Seleciona uma carrinha!");
  const van = vans[selectedVanIndex];
  van.cargo = 0;
  van.route = [];
  refreshVans();
}

function openReport() {
  const panel = document.getElementById("reportPanel");
  panel.style.display = panel.style.display === "none" ? "block" : "none";
  updateReport();
}

function updateReport() {
  document.getElementById("totalDeliveries").innerText = totalDeliveries;
  document.getElementById("vansBought").innerText = vans.length;
}

window.onload = init;
