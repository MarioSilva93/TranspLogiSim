let game = null;
let gameClock = 0;
let intervalId = null;

function startDispatcherWork(company, cidade, pais, nomeJogador) {
  game = {
    player: {
      nome: nomeJogador,
      entregas: 0,
      entregasNoPrazo: 0,
      dinheiroTotal: 0
    },
    company: company,
    sede: cidade,
    pais: pais,
    xp: 0,
    dinheiro: 500000,
    salario: 2000,
    nivel: "Dispatcher Júnior",
    ultimoPagamento: 0,

    vehicles: [
      {
        id: 1, type: 'Carrinha', capacity: 3, speed: 60,
        status: 'Disponível', entregas: [], location: { nome: cidade, lat: cityCoords[cidade][0], lng: cityCoords[cidade][1] }, name: 'Carrinha 1'
      },
      {
        id: 2, type: 'Camião', capacity: 10, speed: 80,
        status: 'Disponível', entregas: [], location: { nome: cidade, lat: cityCoords[cidade][0], lng: cityCoords[cidade][1] }, name: 'Camião 2'
      }
    ],
    staff: [],
    orders: []
  };

  generateOrders(0);
  startClock();
  renderDashboardUI();
}

function startClock() {
  clearInterval(intervalId);
  intervalId = setInterval(() => {
    gameClock++;
    updateDeliveries();
    processSalario();
  }, 1000);
}

function updateDeliveries() {
  if (!game || !game.vehicles) return;

  game.vehicles.forEach(vehicle => {
    const entrega = vehicle.delivery;
    if (entrega && entrega.remainingTime > 0) {
      entrega.remainingTime--;

      // Movimento visual no mapa
      if (typeof atualizarMapa === "function") {
        atualizarMapa();
      }

      if (entrega.remainingTime <= 0) {
        completeDelivery(vehicle);
      }
    }

    // Se for entrega avançada (várias paragens)
    if (entrega && entrega.pedidos && entrega.pedidos.length > 0) {
      entrega.tempoTotal--;
      if (entrega.tempoTotal <= 0) {
        completeDeliveryAvancado(vehicle);
      }
    }
  });
}

function assign(orderId) {
  const order = game.orders.find(o => o.id === orderId);
  const select = document.getElementById(`vehicleSelect_${orderId}`);
  const vehicleId = parseInt(select.value);
  const vehicle = game.vehicles.find(v => v.id === vehicleId);

  if (!vehicle || vehicle.status !== 'Disponível') {
    notificar("❗ Selecione um veículo disponível.", "erro");
    return;
  }

  if (order.weight > vehicle.capacity) {
    notificar("❌ Carga excede a capacidade do veículo!", "erro");
    return;
  }

  const deliveryTime = order.distance / vehicle.speed;
  const deliveryMinutes = Math.round(deliveryTime * 60);

  const p1 = {
    lat: cityCoords[order.from][0],
    lng: cityCoords[order.from][1]
  };
  const p2 = {
    lat: cityCoords[order.to][0],
    lng: cityCoords[order.to][1]
  };

  vehicle.status = `Entregando para ${order.to}`;
  vehicle.delivery = {
    order,
    remainingTime: deliveryMinutes,
    originalTime: deliveryMinutes,
    fromCoords: { ...p1 },
    toCoords: { ...p2 }
  };

  order.assigned = true;
  notificar(`📦 Entrega da carga #${order.id} iniciada.`);
  renderDispatcherUI();
  atualizarMapa();
}

function completeDelivery(vehicle) {
  const entrega = vehicle.delivery;
  const order = entrega.order;
  const deadline = order.deadline * 60;
  const noPrazo = entrega.originalTime <= deadline;

  game.player.entregas++;
  if (noPrazo) {
    game.player.entregasNoPrazo++;
    game.dinheiro += order.weight * 100;
    game.xp += 5;
    notificar(`✅ Entrega #${order.id} concluída no prazo!`);
  } else {
    game.dinheiro += order.weight * 80;
    game.xp += 2;
    notificar(`⚠️ Entrega #${order.id} concluída com atraso.`);
  }

  game.player.dinheiroTotal += order.weight * 100;
  vehicle.status = "Disponível";
  vehicle.delivery = null;
  renderDispatcherUI();
  atualizarMapa();
}

function completeDeliveryAvancado(vehicle) {
  const entrega = vehicle.delivery;

  entrega.pedidos.forEach(order => {
    game.player.entregas++;
    game.player.entregasNoPrazo++;
    game.dinheiro += order.weight * 100;
    game.player.dinheiroTotal += order.weight * 100;
    game.xp += 3;
  });

  notificar(`✅ ${entrega.pedidos.length} entregas concluídas com sucesso.`);
  vehicle.status = "Disponível";
  vehicle.delivery = null;
  renderDispatcherUI();
  atualizarMapa();
}
