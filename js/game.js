let gameClock = 0;
let intervalId;
let game = null;
let currentTab = 'cargas';

function startCareer() {
  document.getElementById("mainMenu").style.display = "none";
  document.getElementById("mainInterface").style.display = "flex";

  document.getElementById("uiContainer").innerHTML = `
    <h2>Modo Carreira - Comece do zero</h2>
    <p>Qual o seu nome?</p>
    <input id="playerName" type="text" placeholder="João Silva" /><br><br>
    <p>Escolha uma empresa:</p>
    <select id="companySelect">
      <option value="Amazon">Amazon</option>
      <option value="DHL">DHL</option>
      <option value="DPD">DPD</option>
    </select><br><br>
    <button class="btn" onclick="applyToJob()">📄 Enviar Currículo</button>
  `;
}

function applyToJob() {
  const company = document.getElementById('companySelect').value;
  const nome = document.getElementById('playerName').value.trim();

  if (!nome) {
    alert("Por favor, insira o seu nome.");
    return;
  }

  document.getElementById("uiContainer").innerHTML = `
    <h2>${nome}, você foi contratado pela ${company}!</h2>
    <p>Comece como Dispatcher Júnior com salário mensal de €2.000.</p>
    <button class="btn" onclick="startDispatcherWork('${company}', '${nome}')">📍 Começar o trabalho</button>
  `;
}

function startDispatcherWork(company, nomeJogador) {
  game = {
    company,
    score: 0,
    dinheiro: 500000, // dinheiro da empresa
    salario: 2000,
    xp: 0,
    nivel: "Dispatcher Júnior",
    ultimoPagamento: 0,
    player: {
      nome: nomeJogador,
      entregas: 0,
      entregasNoPrazo: 0,
      dinheiroTotal: 0
    },
    vehicles: [
      {
        id: 1, type: 'Carrinha', capacity: 3, speed: 60,
        status: 'Disponível', delivery: null, location: 'Uster', name: 'Carrinha 1'
      },
      {
        id: 2, type: 'Camião', capacity: 10, speed: 80,
        status: 'Disponível', delivery: null, location: 'Zurique', name: 'Camião 2'
      }
    ],
    orders: []
  };

  generateOrders(10);
  startClock();
  renderDispatcherUI();
  setup(); // inicia o mapa após o UI estar pronto
}

function generateOrders(qtd) {
  const cargos = ['Roupas', 'Eletrônicos', 'Alimentos', 'Móveis', 'Medicamentos'];
  const cidades = Object.keys(cityCoords);

  for (let i = 0; i < qtd; i++) {
    let from = cidades[randInt(0, cidades.length - 1)];
    let to;
    do {
      to = cidades[randInt(0, cidades.length - 1)];
    } while (to === from);

    const cargo = cargos[randInt(0, cargos.length - 1)];
    const distance = randInt(50, 300);
    const weight = randInt(1, 8);
    const deadline = Math.max((distance / 60).toFixed(1), 1.5);

    game.orders.push({
      id: 100 + i,
      from,
      to,
      cargo,
      weight,
      distance,
      deadline: parseFloat(deadline),
      assigned: false
    });
  }
}

function startClock() {
  clearInterval(intervalId);
  intervalId = setInterval(() => {
    gameClock++;
    updateDeliveries();
    processSalario();
    saveGame();
    if (typeof draw === "function") draw();
  }, 1000);
}

function updateDeliveries() {
  game.vehicles.forEach(vehicle => {
    if (vehicle.delivery) {
      vehicle.delivery.remainingTime--;
      if (vehicle.delivery.remainingTime <= 0) {
        completeDelivery(vehicle);
      }
    }
  });
}

function completeDelivery(vehicle) {
  const order = vehicle.delivery.order;
  const originalTime = vehicle.delivery.originalTime;
  const deadline = order.deadline * 60;

  const foiNoPrazo = originalTime <= deadline;
  completarEntregaComXP(foiNoPrazo);

  game.player.entregas++;
  if (foiNoPrazo) game.player.entregasNoPrazo++;

  // Empresa ganha com a entrega
  const ganho = Math.round(order.distance * 10 + order.weight * 50);
  game.dinheiro += ganho;

  vehicle.location = order.to;
  vehicle.status = "Disponível";
  vehicle.delivery = null;

  renderDispatcherUI();
}

function assign(orderId) {
  const order = game.orders.find(o => o.id === orderId);
  const select = document.getElementById(`vehicleSelect_${orderId}`);
  const vehicleId = parseInt(select.value);
  const vehicle = game.vehicles.find(v => v.id === vehicleId);

  if (!vehicle || vehicle.status !== 'Disponível') {
    alert("Selecione um veículo disponível!");
    return;
  }

  if (order.weight > vehicle.capacity) {
    alert("❌ Carga excede a capacidade do veículo!");
    game.score -= 5;
    renderDispatcherUI();
    return;
  }

  const deliveryTime = order.distance / vehicle.speed;
  const deliveryMinutes = Math.round(deliveryTime * 60);

  const p1 = { lat: cityCoords[order.from][0], lng: cityCoords[order.from][1] };
  const p2 = { lat: cityCoords[order.to][0], lng: cityCoords[order.to][1] };

  vehicle.status = `Entregando para ${order.to}`;
  vehicle.delivery = {
    order,
    remainingTime: deliveryMinutes,
    originalTime: deliveryMinutes,
    fromCoords: { ...p1 },
    toCoords: { ...p2 }
  };

  order.assigned = true;
  alert(`📦 Entrega da carga #${order.id} iniciada.`);
  renderDispatcherUI();
}

function switchTab(tab) {
  currentTab = tab;
  renderDispatcherUI();
}

function saveGame() {
    const dados = {
      game,
      gameClock
    };
    localStorage.setItem("simuladorLogistica", JSON.stringify(dados));
}
  
  function loadGame() {
    const dadosSalvos = localStorage.getItem("simuladorLogistica");
    if (dadosSalvos) {
      const { game: g, gameClock: clk } = JSON.parse(dadosSalvos);
      game = g;
      gameClock = clk;
      renderDispatcherUI();
      startClock();
      setup(); // reinicia o mapa
      return true;
    }
    return false;
}
  
  function resetarProgresso() {
    if (confirm("Tem certeza que quer apagar todo o progresso?")) {
      localStorage.removeItem("simuladorLogistica");
      game = null;
      gameClock = 0;
      location.reload();
    }
}
  
function logout() {
  location.reload();
}
