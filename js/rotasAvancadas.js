let cargaSelecionada = null;

function renderPlanejamentoAvancado() {
  let html = `<h2>🧠 Planejamento de Carga Avançado</h2>`;
  const pendentes = game.orders.filter(o => !o.assigned);

  if (pendentes.length === 0) {
    html += `<p>✅ Nenhuma carga pendente.</p>`;
  } else {
    html += `
      <table class="tabela-cargas">
        <thead>
          <tr>
            <th>#</th><th>Origem</th><th>Destino</th><th>Carga</th><th>Peso</th><th>Distância</th><th>Prazo</th><th>Adicionar</th>
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
          <td>
            <select id="veiculoAvancado_${o.id}">
              <option value="">--Veículo--</option>
              ${game.vehicles
                .filter(v => v.status === "Disponível")
                .map(v => `<option value="${v.id}">${v.name}</option>`)
                .join("")}
            </select>
            <button onclick="adicionarCargaAoVeiculo(${o.id})">➕</button>
          </td>
        </tr>`;
    });

    html += "</tbody></table>";
  }

  html += `<h3>🚛 Entregas Atuais por Veículo:</h3>`;
  game.vehicles.forEach(v => {
    if (v.entregas?.length > 0) {
      html += `<div class="card"><strong>${v.name}</strong><ul>`;
      v.entregas.forEach(e => {
        html += `<li>${e.order.cargo} → ${e.order.to} (${e.order.weight}t)</li>`;
      });
      html += "</ul></div>";
    }
  });

  document.getElementById("uiContainer").innerHTML = html;
}

function adicionarCargaAoVeiculo(orderId) {
  const order = game.orders.find(o => o.id === orderId);
  const select = document.getElementById(`veiculoAvancado_${orderId}`);
  const veiculoId = parseInt(select.value);
  const veiculo = game.vehicles.find(v => v.id === veiculoId);

  if (!veiculo || veiculo.status !== "Disponível") {
    notificar("❌ Veículo indisponível!");
    return;
  }

  if (!veiculo.entregas) veiculo.entregas = [];

  const pesoAtual = veiculo.entregas.reduce((soma, e) => soma + e.order.weight, 0);
  if (pesoAtual + order.weight > veiculo.capacity) {
    notificar("⚠️ Capacidade excedida!");
    return;
  }

  if (!cityCoords[order.from] || !cityCoords[order.to]) {
    notificar("❌ Cidade sem coordenadas no mapa.");
    return;
  }

  const fromCoords = { lat: cityCoords[order.from][0], lng: cityCoords[order.from][1] };
  const toCoords = { lat: cityCoords[order.to][0], lng: cityCoords[order.to][1] };

  const tempo = order.distance / veiculo.speed;
  const minutos = Math.round(tempo * 45);

  veiculo.entregas.push({
    order,
    remainingTime: minutos,
    originalTime: minutos,
    fromCoords,
    toCoords
  });

  order.assigned = true;
  notificar(`📦 Carga #${order.id} adicionada ao ${veiculo.name}`);
  atualizarMapa();
  renderPlanejamentoAvancado();
}
