let veiculoSelecionado = null;
let cargasSelecionadas = [];

function renderPlanejamentoAvancado() {
  let html = `<h2>🧠 Planejamento de Carga Avançado</h2>`;

  // Selecionar o veículo primeiro
  html += `<label for="veiculoEscolhido"><strong>Escolha um veículo:</strong></label><br>`;
  html += `<select id="veiculoEscolhido" onchange="selecionarVeiculoAvancado()">`;
  html += `<option value="">-- Selecione --</option>`;
  game.vehicles
    .filter(v => v.status === "Disponível")
    .forEach(v => {
      html += `<option value="${v.id}" ${veiculoSelecionado?.id === v.id ? "selected" : ""}>${v.name}</option>`;
    });
  html += `</select><br><br>`;

  if (!veiculoSelecionado) {
    html += `<p>🚛 Selecione um veículo para ver cargas compatíveis.</p>`;
    document.getElementById("uiContainer").innerHTML = html;
    return;
  }

  const capacidadeRestante = veiculoSelecionado.capacity - cargasSelecionadas.reduce((s, c) => s + c.order.weight, 0);
  const pendentes = game.orders.filter(o => !o.assigned && o.weight <= capacidadeRestante);

  html += `<p>🔄 Capacidade restante: <strong>${capacidadeRestante}t</strong></p>`;

  if (pendentes.length === 0) {
    html += `<p>✅ Nenhuma carga disponível compatível.</p>`;
  } else {
    html += `
      <table class="tabela-cargas">
        <thead>
          <tr>
            <th>#</th><th>Origem</th><th>Destino</th><th>Carga</th><th>Peso</th><th>Distância</th><th>Prazo</th><th>Ação</th>
          </tr>
        </thead><tbody>
    `;
    pendentes.forEach(o => {
      html += `
        <tr>
          <td>#${o.id}</td>
          <td>${o.from}</td>
          <td>${o.to}</td>
          <td>${o.cargo}</td>
          <td>${o.weight}t</td>
          <td>${o.distance}km</td>
          <td>${o.deadline}h</td>
          <td><button onclick="adicionarCargaAoPlanejamento(${o.id})">➕</button></td>
        </tr>
      `;
    });
    html += `</tbody></table>`;
  }

  if (cargasSelecionadas.length > 0) {
    html += `<h3>🚚 Cargas Selecionadas:</h3><ul>`;
    cargasSelecionadas.forEach(e => {
      html += `<li>${e.order.cargo} → ${e.order.to} (${e.order.weight}t)</li>`;
    });
    html += `</ul><button class="btn" onclick="confirmarEnvioAvancado()">📤 Despachar Veículo</button>`;
  }

  document.getElementById("uiContainer").innerHTML = html;
}

function selecionarVeiculoAvancado() {
  const id = parseInt(document.getElementById("veiculoEscolhido").value);
  veiculoSelecionado = game.vehicles.find(v => v.id === id);
  cargasSelecionadas = [];
  renderPlanejamentoAvancado();
}

function adicionarCargaAoPlanejamento(orderId) {
  const order = game.orders.find(o => o.id === orderId);
  if (!veiculoSelecionado || order.assigned) return;

  const capacidadeAtual = cargasSelecionadas.reduce((s, c) => s + c.order.weight, 0);
  if (capacidadeAtual + order.weight > veiculoSelecionado.capacity) {
    notificar("⚠️ Capacidade excedida!");
    return;
  }

  const fromCoords = cityCoords[order.from];
  const toCoords = cityCoords[order.to];

  if (!fromCoords || !toCoords) {
    notificar("❌ Cidade não mapeada.");
    return;
  }

  const tempo = order.distance / veiculoSelecionado.speed;
  const minutos = Math.round(tempo * 45);

  cargasSelecionadas.push({
    order,
    remainingTime: minutos,
    originalTime: minutos,
    fromCoords: { lat: fromCoords[0], lng: fromCoords[1] },
    toCoords: { lat: toCoords[0], lng: toCoords[1] }
  });

  order.assigned = true;
  notificar(`📦 Carga #${order.id} adicionada ao plano.`);
  renderPlanejamentoAvancado();
}

function confirmarEnvioAvancado() {
  if (cargasSelecionadas.length === 0) return;

  veiculoSelecionado.status = "Em entrega";
  veiculoSelecionado.entregas = cargasSelecionadas;

  notificar(`✅ ${veiculoSelecionado.name} saiu com ${cargasSelecionadas.length} entregas.`);
  atualizarMapa();
  veiculoSelecionado = null;
  cargasSelecionadas = [];
  renderDispatcherUI();
}
