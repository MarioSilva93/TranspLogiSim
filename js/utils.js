
function getEmpresaNome() {
  return localStorage.getItem("empresa_nome") || "Desconhecido";
}
function getJogadorNome() {
  return localStorage.getItem("player_name") || "Desconhecido";
}
function getCidadeEscolhida() {
  return localStorage.getItem("cidade_escolhida") || "Lisbon";
}
function goBack() {
  window.location.href = "index.html";
}
function notificar(msg) {
  const container = document.getElementById('notificacoes');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}
function tempoAgora() {
  return new Date().toLocaleTimeString();
}


const lojasPorCidade = {
  "Paris": ["Carrefour", "FNAC", "Monoprix", "Leroy Merlin", "Decathlon", "Darty"],
  "Berlin": ["Lidl", "MediaMarkt", "Kaufland", "Aldi", "Rewe", "Saturn"],
  "Madrid": ["Mercadona", "El Corte Inglés", "Dia", "Carrefour", "Alcampo", "MediaMarkt"],
  "Lisbon": ["Continente", "Worten", "Pingo Doce", "Auchan", "Staples", "FNAC"],
  "Rome": ["Coop", "Esselunga", "Conad", "Carrefour", "MediaWorld", "Euronics"],
  "Barcelona": ["Bonpreu", "FNAC", "Decathlon", "Carrefour", "El Corte Inglés", "MediaMarkt"],
  "Munich": ["Edeka", "Kaufland", "Saturn", "Rewe", "MediaMarkt", "Aldi"],
  "Porto": ["Continente", "Pingo Doce", "Worten", "FNAC", "Lidl", "Decathlon"],
  "Lyon": ["Carrefour", "FNAC", "Decathlon", "Boulanger", "Casino", "Intermarché"],
  "Milan": ["Esselunga", "Carrefour", "MediaWorld", "Unes", "Euronics", "Conad"]
};
