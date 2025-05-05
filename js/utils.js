// Nível do jogador com base em XP
function getLevel(xp) {
    return Math.floor(xp / 100) + 1;
  }
  
  // Porcentagem da barra de XP
  function getXPPercent(xp) {
    return Math.min(xp % 100, 100);
  }
  
  // Notificação visual
  function showNotification(message, type = "success") {
    const notif = document.getElementById("notification");
  
    notif.className = "notification show " + type;
  
    let icon = "";
    if (type === "success") icon = "✔️";
    if (type === "error") icon = "❌";
    if (type === "warning") icon = "⚠️";
  
    notif.innerHTML = `<span class="icon">${icon}</span> ${message}`;
  
    setTimeout(() => {
      notif.classList.remove("show");
    }, 3000);
  }
  
  // Gerar nomes aleatórios de clientes
  function generatePersonName() {
    const first = ["Laura", "Miguel", "Sofia", "Tiago", "Nina", "Pedro", "Joana", "Filipe"];
    const last = ["Silva", "Schmidt", "Costa", "Meier", "Ferreira", "Keller", "Ribeiro"];
    return `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`;
  }
  
  // Gerar nomes de lojas reais
  function generateStoreName() {
    const stores = ["Lidl Uster", "Migros Greifensee", "Coop Supermarkt", "ALDI SUISSE", "Denner", "Fressnapf", "Interdiscount"];
    return stores[Math.floor(Math.random() * stores.length)];
  }
  
  // Coordenadas aleatórias dentro de um raio em torno de Uster
  function generateCoords() {
    const index = Math.floor(Math.random() * realAddresses.length);
    return realAddresses[index];
}
  
  