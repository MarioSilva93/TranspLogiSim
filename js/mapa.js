
let mapa;
let marcadores = {};
let posicoes = {};

function initMapa() {
  mapa = L.map("map").setView([46.9481, 7.4474], 7);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapa);
}

function atualizarMarcador(nome, posicao) {
  if (marcadores[nome]) {
    marcadores[nome].setLatLng(posicao);
  } else {
    marcadores[nome] = L.marker(posicao).addTo(mapa).bindPopup(nome);
  }
  posicoes[nome] = posicao;
}

function moverPara(nome, destino, callback) {
  let origem = posicoes[nome] || [46.9481, 7.4474];
  let passos = 20;
  let passo = 0;
  const intervalo = setInterval(() => {
    passo++;
    let lat = lerp(origem[0], destino[0], passo / passos);
    let lng = lerp(origem[1], destino[1], passo / passos);
    let novaPos = [lat, lng];
    atualizarMarcador(nome, novaPos);

    if (passo >= passos) {
      clearInterval(intervalo);
      callback();
    }
  }, 200);
}
