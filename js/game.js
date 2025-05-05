let selectedVanIndex = null;
let playerMoney = 10000;
let vans = [
    { name: "Carrinha 1", color: "#FF5733", fuel: 100, maintenance: 100, xp: 0, cargo: 0, maxLoad: 3500, route: [], marker: null, polyline: null },
    { name: "Carrinha 2", color: "#33A1FF", fuel: 100, maintenance: 100, xp: 0, cargo: 0, maxLoad: 3500, route: [], marker: null, polyline: null },
    { name: "Caminhão", color: "#2ECC71", fuel: 100, maintenance: 100, xp: 0, cargo: 0, maxLoad: 25000, route: [], marker: null, polyline: null }
];
  

const personIcon = L.icon({
  iconUrl: 'images/pngwing.com.png',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
});

const storeIcon = L.icon({
  iconUrl: 'images/tettedacas.png',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
});

let deliveries = [];
const maxDeliveries = 50;
const deliveryLayerGroup = L.layerGroup();
const depotCoords = [47.3615, 8.7169]; // Coordenadas da sede


function getLevel(xp) {
  return Math.floor(xp / 100) + 1;
}

function getXPPercent(xp) {
  return Math.min(xp % 100, 100);
}

function init() {
  const player = sessionStorage.getItem("playerName");
  const company = sessionStorage.getItem("companyName");

  if (!player || !company) {
    window.location.href = "setup.html";
    return;
  }

  document.getElementById("playerInfo").innerHTML = `Jogador: ${player}<br>Empresa: <strong>${company}</strong>`;
  document.getElementById("money").innerText = `Saldo: ${playerMoney.toFixed(2)}€`;

  initMap(company);
  deliveryLayerGroup.addTo(window.map);

  refreshVans();
  for (let i = 0; i < maxDeliveries; i++) {
    setTimeout(() => addDelivery(), i * 100); // distribui no tempo
  }
  
  setInterval(updateDeliveries, 20000);
}

function buyVan() {
    const cost = 8000;
    if (playerMoney < cost) {
      showNotification("Dinheiro insuficiente para comprar uma carrinha!", "error");
      return;
    }
  
    const color = getRandomColor();
    vans.push({
      name: `Carrinha ${vans.length + 1}`,
      color,
      fuel: 100,
      maintenance: 100,
      xp: 0,
      cargo: 0,
      maxLoad: 3500,
      route: [],
      marker: null,
      polyline: null
    });
  
    playerMoney -= cost;
    showNotification(`Nova carrinha comprada! Saldo: ${playerMoney.toFixed(2)}€`, "success");
    refreshVans();
    updateMoney();
    saveGame();
}
  

function updateMoney() {
  document.getElementById("money").innerText = `Saldo: ${playerMoney.toFixed(2)}€`;
}

function showNotification(message, type = "success") {
  const notif = document.getElementById("notification");
  notif.className = "notification show " + type;

  let icon = "";
  if (type === "success") icon = "✔️";
  if (type === "error") icon = "❌";
  if (type === "warning") icon = "⚠️";

  notif.innerHTML = `<span class="icon">${icon}</span> ${message}`;
  setTimeout(() => notif.classList.remove("show"), 3000);
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
      <div class="xp-bar"><div class="xp-fill" style="width:${getXPPercent(van.xp)}%"></div></div>
      <div>Peso: ${van.cargo}kg / ${van.maxLoad}kg</div>
      <div class="load-bar"><div class="load-fill" style="width:${(van.cargo / van.maxLoad) * 100}%"></div></div>
      <button onclick="dispatchRoute(${index})">Despachar</button>
    `;

    box.onclick = () => {
      selectedVanIndex = index;
      refreshVans();
    };

    box.ondragover = (e) => e.preventDefault();
    box.ondrop = (e) => {
      e.preventDefault();
      const deliveryIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
      const delivery = deliveries[deliveryIndex];
      if (!delivery) return;

      if (van.cargo + delivery.weight <= van.maxLoad) {
        van.cargo += delivery.weight;
        van.route.push(delivery.coords);

        // Atualizar polyline se já existir
        if (van.polyline) {
          map.removeLayer(van.polyline);
        }
        van.polyline = L.polyline(van.route, {
          color: van.color,
          weight: 3
        }).addTo(map);
        
        // Atualizações visuais
        deliveryLayerGroup.removeLayer(delivery.marker);
        deliveries.splice(deliveryIndex, 1);
        updateDeliveryList();
        refreshVans();
        
      } else {
        showNotification("Carrinha ou caminhão sobrecarregado!", "error");
      }
    };

    container.appendChild(box);
  });
}

function addDelivery() {
  if (deliveries.length >= maxDeliveries) return;
  const isStore = Math.random() > 0.5;
  const name = isStore ? generateStoreName() : generatePersonName();
  const coords = generateCoords();
  const weight = isStore ? Math.floor(Math.random() * 4000) + 1000 : Math.floor(Math.random() * 200) + 50;
  
  const marker = L.marker(coords, {
    icon: isStore ? storeIcon : personIcon
  }).addTo(deliveryLayerGroup).bindPopup(`<b>${name}</b><br>Peso: ${weight}kg`);
  
  deliveries.push({ name, coords, weight, marker, type: isStore ? "store" : "person" });
  updateDeliveryList();
  
}

function updateDeliveryList() {
    const list = document.getElementById("deliveries");
    list.innerHTML = "";
  
    deliveries.forEach((delivery, i) => {
      const li = document.createElement("li");
      li.className = "delivery-item";
  
      const emoji = delivery.type === "store" ? "📦" : "👤";
      li.textContent = `${emoji} ${delivery.name} - Peso: ${delivery.weight}kg`;
  
      li.draggable = true;
      li.dataset.index = i;
      li.ondragstart = (e) => e.dataTransfer.setData("text/plain", i);
  
      list.appendChild(li);
    });
}
  

function dispatchRoute(index) {
    const van = vans[index];
  
    if (!van || !van.route || van.route.length === 0) {
      showNotification("Sem entregas atribuídas.", "warning");
      return;
    }
  
    // Construir rota completa com ida e volta da sede
    const fullRoute = [depotCoords, ...van.route, depotCoords];
    van.route = fullRoute;
  
    moveVanOnMap(van, van.maxLoad >= 25000 ? "truck" : "van");
  
    van.fuel -= 5;
    van.xp += 10;
    updateMoney();
    refreshVans();
}

function updateDeliveries() {
    if (deliveries.length < maxDeliveries) {
      addDelivery();
    } else {
      // Remover o mais antigo para manter o fluxo
      const removed = deliveries.shift();
      deliveryLayerGroup.removeLayer(removed.marker);
      addDelivery();
    }
  
    updateDeliveryList();
}

function saveGame() {
  const data = {
    vans,
    deliveries,
    stats: { totalDeliveries: 0 },
    money: playerMoney
  };
  localStorage.setItem("saveData", JSON.stringify(data));
}

function loadGame() {
  const saved = localStorage.getItem("saveData");
  if (saved) {
    const data = JSON.parse(saved);
    vans = data.vans.length ? data.vans : defaultFleet();
  } else {
    vans = defaultFleet();
  }
}

function defaultFleet() {
  return [
    { name: "Carrinha 1", fuel: 100, maintenance: 100, xp: 0, cargo: 0, maxLoad: 3500, route: [], marker: null },
    { name: "Carrinha 2", fuel: 100, maintenance: 100, xp: 0, cargo: 0, maxLoad: 3500, route: [], marker: null },
    { name: "Caminhão", fuel: 100, maintenance: 100, xp: 0, cargo: 0, maxLoad: 25000, route: [], marker: null }
  ];
}

function getRandomColor() {
    const colors = ["#FF5733", "#33A1FF", "#2ECC71", "#FFC300", "#8E44AD", "#00CED1"];
    return colors[Math.floor(Math.random() * colors.length)];
}
  

window.onload = init;
