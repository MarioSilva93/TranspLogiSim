
let mapa;
let carrinhas = [{ id: 1, nome: 'Carrinha 1', livre: true }];
let entregas = [];
let entregasSelecionadas = [];
let relatorios = [];

let xp = 0;
let saldo = 2500;
let entregasFeitas = 0;

let marcadorCarrinhas = {};
let cidade = getCidadeEscolhida();
let baseCoords = {
  "Paris": [48.8566, 2.3522],
  "Lyon": [45.75, 4.85],
  "Berlin": [52.52, 13.405],
  "Munich": [48.137, 11.575],
  "Rome": [41.9028, 12.4964],
  "Milan": [45.4642, 9.19],
  "Madrid": [40.4168, -3.7038],
  "Barcelona": [41.3851, 2.1734],
  "Lisbon": [38.7169, -9.1399],
  "Porto": [41.1496, -8.6109]
};

window.onload = () => {
  cidade = getCidadeEscolhida();
  document.getElementById("cidadeAtual").textContent = cidade;
  document.getElementById("empresaNome").textContent = getEmpresaNome();
  document.getElementById("playerNome").textContent = getJogadorNome();

  initMapa();
  carregarProgresso();
  renderStats();
  renderRelatorios();
  renderEntregas();
  renderCarrinhas();
};

function initMapa() {
  const pos = baseCoords[cidade] || [38.7169, -9.1399];
  mapa = L.map("map").setView(pos, 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapa);

  gerarEntregas();
}

function gerarEntregas() {
  const lojas = lojasPorCidade[cidade] || ["Loja A", "Loja B", "Loja C"];
  entregas = lojas.map((nome, i) => {
    const dx = (Math.random() - 0.5) * 0.1;
    const dy = (Math.random() - 0.5) * 0.1;
    const [lat, lng] = baseCoords[cidade];
    const coords = [lat + dx, lng + dy];
    L.marker(coords).addTo(mapa).bindPopup("🏬 " + nome);
    return { id: i + 1, loja: nome, coords };
  });
}

function renderEntregas() {
  const painel = document.getElementById("painel-entregas");
  painel.innerHTML = "<h3>📦 Entregas</h3>";

  entregas.forEach(e => {
    const checked = entregasSelecionadas.includes(e.id) ? "checked" : "";
    const div = document.createElement("div");
    div.className = "entrega-item";
    div.innerHTML = `
      <input type="checkbox" onchange="selecionarEntrega(${e.id})" ${checked}>
      <strong>${e.loja}</strong>
    `;
    painel.appendChild(div);
  });

  painel.innerHTML += `
    <button onclick="despachar()">🚚 Despachar Entregas</button>
    <button onclick="comprarCarrinha()">➕ Comprar Carrinha (2000€)</button>
  `;
}

function renderCarrinhas() {
  const pos = baseCoords[cidade];
  carrinhas.forEach(c => {
    if (!marcadorCarrinhas[c.id]) {
      marcadorCarrinhas[c.id] = L.marker(pos).addTo(mapa).bindPopup("🚚 " + c.nome);
    }
  });
}

function renderStats() {
  document.getElementById("xp").textContent = xp;
  document.getElementById("saldo").textContent = saldo + " €";
  document.getElementById("entregasFeitas").textContent = entregasFeitas;
}

function selecionarEntrega(id) {
  if (entregasSelecionadas.includes(id)) {
    entregasSelecionadas = entregasSelecionadas.filter(e => e !== id);
  } else {
    entregasSelecionadas.push(id);
  }
}

function comprarCarrinha() {
  if (saldo < 2000) return notificar("💸 Saldo insuficiente.");
  const id = carrinhas.length + 1;
  carrinhas.push({ id, nome: "Carrinha " + id, livre: true });
  saldo -= 2000;
  notificar("🚚 Nova carrinha comprada!");
  renderStats();
  renderCarrinhas();
  salvarProgresso();
}

function despachar() {
  if (entregasSelecionadas.length === 0) return notificar("Seleciona pelo menos uma entrega.");
  const livre = carrinhas.find(c => c.livre);
  if (!livre) return notificar("❌ Sem carrinhas livres!");

  const lista = entregas.filter(e => entregasSelecionadas.includes(e.id));
  entregasSelecionadas = [];
  livre.livre = false;
  moverCarrinha(livre, lista);
}

function moverCarrinha(carrinha, lista) {
  let i = 0;
  const mover = () => {
    if (i >= lista.length) {
      carrinha.livre = true;
      notificar(`✅ ${carrinha.nome} concluiu a ronda.`);
      salvarProgresso();
      return;
    }

    const entrega = lista[i];
    const marcador = marcadorCarrinhas[carrinha.id];
    const destino = entrega.coords;
    let passo = 0;
    const origem = marcador.getLatLng();
    const passos = 30;

    const animar = setInterval(() => {
      passo++;
      const lat = origem.lat + (destino[0] - origem.lat) * (passo / passos);
      const lng = origem.lng + (destino[1] - origem.lng) * (passo / passos);
      marcador.setLatLng([lat, lng]);
      if (passo >= passos) {
        clearInterval(animar);
        xp += 10;
        saldo += 50;
        entregasFeitas++;
        relatorios.push({ loja: entrega.loja, hora: tempoAgora() });
        renderStats();
        renderRelatorios();
        i++;
        mover();
      }
    }, 100);
  };
  mover();
}

function renderRelatorios() {
  const painel = document.getElementById("painel-relatorios");
  painel.innerHTML = "<h3>📋 Relatórios</h3>";
  relatorios.slice().reverse().forEach(r => {
    const el = document.createElement("div");
    el.className = "entrega-item";
    el.innerHTML = `➡️ ${r.loja} às ${r.hora}`;
    painel.appendChild(el);
  });
}

function salvarProgresso() {
  const dados = {
    xp, saldo, entregasFeitas, relatorios, carrinhas
  };
  localStorage.setItem("cidade_progresso", JSON.stringify(dados));
}

function carregarProgresso() {
  const salvo = localStorage.getItem("cidade_progresso");
  if (salvo) {
    const dados = JSON.parse(salvo);
    xp = dados.xp || 0;
    saldo = dados.saldo || 0;
    entregasFeitas = dados.entregasFeitas || 0;
    relatorios = dados.relatorios || [];
    carrinhas = dados.carrinhas || [];
  }
}


function calcularDistanciaKm([lat1, lon1], [lat2, lon2]) {
  const R = 6371; // raio da Terra
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);
  const a = Math.sin(dLat/2) ** 2 +
            Math.cos(radians(lat1)) * Math.cos(radians(lat2)) *
            Math.sin(dLon/2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
function radians(graus) {
  return graus * Math.PI / 180;
}

function mostrarInfoEntrega(id) {
  const entrega = entregas.find(e => e.id === id);
  const dist = calcularDistanciaKm(baseCoords[cidade], entrega.coords);
  const xpEst = Math.floor(dist * 5);
  const premio = Math.floor(dist * 80 + 20);
  alert(`📦 Entrega para ${entrega.loja}\nDistância: ${dist.toFixed(1)} km\nXP: ${xpEst}\nPagamento: ${premio}€`);
}
