// Estrutura inicial para TranspLogiSimve com melhorias integradas
// Este ficheiro serve como ponto de entrada para consolidar os módulos e lógica do jogo

window.onload = () => {
    if (!window.game) return;
  
    inicializarJogo();
  };
  
  function inicializarJogo() {
    setupPerfil();
    atualizarInterface();
    atualizarMapa();
    iniciarClock();
    gerarEntregasAleatorias(5);
  }
  
  function atualizarInterface() {
    renderDispatcherUI();
    renderXPChart();
    renderEntregasChart();
    renderPainelEntregas();
  }
  
  function iniciarClock() {
    setInterval(() => {
      gameClock++;
      processarTempoDeEntregas();
      processManutencao();
      processSalario();
    }, 1000);
  }
  
  function gerarEntregasAleatorias(qtd) {
    const cidades = Object.keys(cityCoords);
    for (let i = 0; i < qtd; i++) {
      const origem = cidades[Math.floor(Math.random() * cidades.length)];
      let destino = cidades[Math.floor(Math.random() * cidades.length)];
      while (destino === origem) {
        destino = cidades[Math.floor(Math.random() * cidades.length)];
      }
      const distancia = calcularDistancia(cityCoords[origem], cityCoords[destino]);
      const prazo = 12 + Math.floor(Math.random() * 24); // prazo entre 12h e 36h
      const peso = Math.floor(Math.random() * 8) + 1;
  
      game.orders.push({
        id: game.orders.length + 1,
        from: origem,
        to: destino,
        cargo: gerarDescricaoCarga(),
        weight: peso,
        distance: Math.round(distancia),
        deadline: prazo,
        assigned: false
      });
    }
  }
  
  function gerarDescricaoCarga() {
    const tipos = ["Mobiliário", "Eletrónica", "Alimentos", "Medicamentos", "Livros", "Têxteis"];
    return tipos[Math.floor(Math.random() * tipos.length)];
  }
  
  function calcularDistancia(coordA, coordB) {
    const R = 6371;
    const dLat = toRad(coordB[0] - coordA[0]);
    const dLon = toRad(coordB[1] - coordA[1]);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(coordA[0])) * Math.cos(toRad(coordB[0])) *
              Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  function toRad(value) {
    return value * Math.PI / 180;
  }
  
  function renderPainelEntregas() {
    const painel = document.getElementById("painel-entregas");
    if (!painel) return;
  
    painel.innerHTML = "<h3>📦 Entregas Disponíveis</h3>";
  
    game.orders.filter(o => !o.assigned).forEach(order => {
      const div = document.createElement("div");
      div.className = "entrega-item";
      div.innerHTML = `
        <strong>${order.cargo}</strong><br>
        De: ${order.from} → ${order.to}<br>
        Peso: ${order.weight}t | Dist: ${order.distance}km<br>
        Prazo: ${order.deadline}h
        <button onclick="atribuirEntrega(${order.id})">Atribuir</button>
      `;
      painel.appendChild(div);
    });
  }
  
  function atribuirEntrega(id) {
    const entrega = game.orders.find(o => o.id === id);
    const veiculo = game.vehicles.find(v => !v.emEntrega);
  
    if (!entrega || !veiculo) {
      notificar("❌ Sem veículo disponível ou entrega inválida.");
      return;
    }
  
    entrega.assigned = true;
    veiculo.emEntrega = true;
    veiculo.entrega = entrega;
    veiculo.tempoRestante = entrega.deadline;
  
    notificar(`🚚 Entrega de ${entrega.cargo} atribuída a ${veiculo.nome}`);
    atualizarInterface();
    atualizarMapa();
  }
  