let map;
let selectedVanIndex = null;
let vans = [
    { name: "Carrinha 1", fuel: 100, maintenance: 100, xp: 0, cargo: 0, maxLoad: 3500, route: [], marker: null },
    { name: "Carrinha 2", fuel: 100, maintenance: 100, xp: 0, cargo: 0, maxLoad: 3500, route: [], marker: null },
    { name: "Caminhão", fuel: 100, maintenance: 100, xp: 0, cargo: 0, maxLoad: 25000, route: [], marker: null }
];
// Definindo os ícones para cliente pessoa e loja
const personIcon = L.icon({
    iconUrl: 'images/pngwing.com.png', // Caminho para o ícone de cliente (pessoa)
    iconSize: [30, 30], // Tamanho do ícone
    iconAnchor: [15, 15], // Centro do ícone
    popupAnchor: [0, -15] // Posição do popup
  });
  
  const storeIcon = L.icon({
    iconUrl: 'images/tettedacas.png', // Caminho para o ícone de loja
    iconSize: [30, 30], // Tamanho do ícone
    iconAnchor: [15, 15], // Centro do ícone
    popupAnchor: [0, -15] // Posição do popup
  });
  
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
            <div>Peso: ${van.cargo}kg / ${van.maxLoad}kg</div>
            <div class="load-bar">
                <div class="load-fill" style="width:${(van.cargo / van.maxLoad) * 100}%"></div>
            </div>
        `;
        box.onclick = () => {
            selectedVanIndex = index;
            refreshVans();
        };
        box.ondragover = (e) => e.preventDefault();
        box.ondrop = (e) => {
          e.preventDefault();
          const deliveryIndex = e.dataTransfer.getData("text/plain");
          const delivery = deliveries[deliveryIndex];
          const van = vans[index];
        
          if ((van.cargo + delivery.weight) > van.maxLoad) {
            showNotification("Carrinha sobrecarregada!", "error");
            return;
          }
        
          van.cargo += delivery.weight;
          van.route.push(delivery.coords);
          L.polyline(van.route, { color: van.icon }).addTo(map);
        
          deliveryLayerGroup.removeLayer(delivery.marker);
          deliveries.splice(deliveryIndex, 1);
          updateDeliveryList();
          refreshVans();
        };
        
        
        container.appendChild(box);
    });
}

  

function generateName() {
    const nomes = ["Clara", "Pedro", "Nina", "Jonas", "Laura", "Fabio", "Marta", "Luis", "Sara", "André"];
    const apelidos = ["Silva", "Müller", "Keller", "Costa", "Schmidt", "Ferreira", "Meier", "Ribeiro"];
    return `${nomes[Math.floor(Math.random() * nomes.length)]} ${apelidos[Math.floor(Math.random() * apelidos.length)]}`;
}  
  
function generateStore() {
    const lojas = ["Lidl Uster", "Migros Greifensee", "Coop Supermarkt", "ALDI SUISSE", "Denner", "Fressnapf", "Interdiscount"];
    return lojas[Math.floor(Math.random() * lojas.length)];
}
  
  
function generateCoords() {
    const usterLat = 47.351;  // Latitude de Uster
    const usterLng = 8.717;  // Longitude de Uster
    const radius = 15000;  // Raio de 20 km em metros (alterado de 50 km para 20 km)
  
    // Gerar uma coordenada aleatória dentro de um raio de 20km de Uster
    const randomAngle = Math.random() * 2 * Math.PI;  // Um ângulo aleatório
    const randomDistance = Math.random() * radius;  // Distância aleatória até 20km
  
    // Calcular as coordenadas baseadas no ângulo e distância
    const latOffset = randomDistance * Math.sin(randomAngle) / 111000;  // Conversão para graus
    const lngOffset = randomDistance * Math.cos(randomAngle) / (111000 * Math.cos(usterLat * Math.PI / 180));
  
    return [usterLat + latOffset, usterLng + lngOffset];
}
  
  

// Ícones para cliente pessoa e loja
function addDelivery() {
    if (deliveries.length >= maxDeliveries) return;
  
    const isStore = Math.random() > 0.5;  // 50% chance de ser cliente loja
    const name = isStore ? generateStore() : generateName();
    const coords = generateCoords();
  
    // Se for loja, peso entre 1 e 5 toneladas (1000 a 5000kg)
    const weight = isStore ? Math.floor(Math.random() * 4000) + 1000 : Math.floor(Math.random() * 200) + 50;
  
    // Atribuindo o ícone correto para a entrega
    const marker = L.marker(coords, { icon: isStore ? storeIcon : personIcon }).addTo(deliveryLayerGroup)
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
    deliveries.forEach((d, i) => {
      const li = document.createElement("li");
  
      // Adiciona ícone e cor baseado se for loja ou cliente pessoa
      const isStore = Math.random() > 0.5;  // Exemplo, mas pode usar o mesmo critério que em addDelivery
      li.classList.add(isStore ? "store" : "person");
  
      li.innerHTML = `
        <span class="icon">${isStore ? "🏬" : "👤"}</span>
        <strong>${d.name}</strong><br>
        Peso: ${d.weight}kg
        <button class="assign-btn" onclick="addToRoute(${d.coords}, ${d.weight})">Adicionar à Rota</button>
      `;
  
      li.draggable = true;
      li.dataset.index = i;
      li.ondragstart = (e) => {
        e.dataTransfer.setData("text/plain", i);
      };
  
      list.appendChild(li);
    });
}
  
  

function addToRoute(lat, lng, weight) {
    if (selectedVanIndex === null) return alert("Seleciona uma carrinha primeiro.");
    const van = vans[selectedVanIndex];
  
    // Se for o caminhão, permite carregar mais peso
    if (van.maxLoad === 25000) {
      if ((van.cargo + weight) > van.maxLoad) {
        return alert("Caminhão sobrecarregado!");
      }
    } else {
      // Carrinhas têm limite de 3,5 toneladas
      if ((van.cargo + weight) > van.maxLoad) {
        return alert("Carrinha sobrecarregada!");
      }
    }
  
    van.cargo += weight;
    van.route.push([lat, lng]);
    L.polyline(van.route, { color: van.icon }).addTo(map);
}
  

function dispatchRoute() {
    if (selectedVanIndex === null) return;
    const van = vans[selectedVanIndex];
    if (!van.route.length) return;
  
    // Remover a carrinha antiga
    if (van.marker) map.removeLayer(van.marker);
  
    // Adicionar nova carrinha e iniciar o movimento
    van.marker = L.marker(van.route[0], { icon: van.icon }).addTo(map);
  
    let step = 0;
  
    function move() {
      if (step >= van.route.length) {
        van.cargo = 0;  // A carrinha fica vazia
        showNotification(`${van.name} terminou a entrega! Carrinha vazia agora.`, "success");
        refreshVans();
        return;  // Finaliza o movimento
      }
  
      // Atualizar a posição da carrinha
      van.marker.setLatLng(van.route[step]);
  
      // Atualizar o combustível, XP e a barra visual
      van.fuel -= 5;
      van.xp += 10;
      refreshVans();
  
      // Ajustar automaticamente o mapa para a nova posição da carrinha
      map.panTo(van.marker.getLatLng());  // Centraliza o mapa na posição da carrinha
  
      step++;
  
      // Continuar a mover a carrinha a cada 1,2 segundos
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
  if (selectedVanIndex === null) return showNotification("Seleciona uma carrinha!");
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
  if (selectedVanIndex === null) return showNotification("Seleciona uma carrinha!");
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
  if (selectedVanIndex === null) return showNotification("Seleciona uma carrinha!");
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

function showNotification(message, type = "success") {
    const notif = document.getElementById("notification");
  
    // Adicionar o tipo de notificação (sucesso, erro, alerta)
    notif.className = "notification show " + type;
    
    // Adicionar ícone baseado no tipo
    let icon = "";
    if (type === "success") {
      icon = "✔️"; // ícone de sucesso
    } else if (type === "error") {
      icon = "❌"; // ícone de erro
    } else if (type === "warning") {
      icon = "⚠️"; // ícone de alerta
    }
  
    notif.innerHTML = `<span class="icon">${icon}</span>${message}`;
  
    // Fazer a notificação desaparecer após 3 segundos
    setTimeout(() => {
      notif.classList.remove("show");
    }, 3000);
}
  
  
window.onload = init;
