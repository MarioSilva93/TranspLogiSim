let veiculoSelecionado = null;

function renderPlanejamentoAvancado() {
  const container = document.getElementById("uiContainer");
  container.className = ""; // Remove classe antiga (evita grid indesejado)

  let html = `<h2>🧠 Planeamento Avançado</h2>`;
  html += `<div class="planejamento-avancado">`;

  // 🟦 Coluna 1: Seleção de veículo
  html += `<div>
    <h3>1️⃣ Veículo disponível</h3>`;
  const disponiveis = game.vehicles.filter(v => v.status === "Disponível");
  if (disponiveis.length === 0) {
    html += `<p>❌ Nenhum veículo disponível.</p>`;
  } else {
    html += `<select id="seletorVeiculo" onchange="selecionarVeiculoAvancado()">`;
    html += `<option value="">-- Escolher --</option>`;
    disponiveis.forEach(v => {
      html += `<option value="${v.id}">${v.name} (${v.capacity}t)</option>`;
    });
    html += `</select>`;
  }
  html += `</div>`;

  // 🟩 Coluna 2: Cargas próximas
  html += `<div><h3>2️⃣ Cargas compatíveis</h3>`;
  if (veiculoSelecionado) {
    const veiculo = game.vehicles.find(v => v.id === veiculoSelecionado);
    const pesoAtual = veiculo.entregas?.reduce((s, e) => s + e.order.weight, 0) || 0;
    const pesoRestante = veiculo.capacity - pesoAtual;

    html += `<p>Peso restante: <strong>${pesoRestante}t</strong></p>`;
    html += `
      <table class="tabela-cargas">
        <thead>
          <tr><th>ID</th><th>De</th><th>Para</th><th>Carga</th><th>Peso</th><th>Distância</th><th>Prazo</th><th>Ação</th></tr>
        </thead><tbody>
    `;

    game.orders.filter(o => !o.assigned).forEach(o => {
      const distancia = calcularDistanciaEntre(veiculo.location, o.from);
      const podeAdicionar = pesoRestante >= o.weight && distancia <= 50;

      html += `<tr>
        <td>#${o.id}</td>
        <td>${o.from} (${distancia.toFixed(0)}km)</td>
        <td>${o.to}</td>
        <td>${o.cargo}</td>
        <td>${o.weight}t</td>
        <td>${o.distance}km</td>
        <td>${o.deadline}h</td>
        <td>${podeAdicionar
          ? `<button onclick="adicionarCargaPlaneada(${o.id})">➕</button>`
          : `<span style="color:#888;">Indisponível</span>`}</td>
      </tr>`;
    });

    html += `</tbody></table>`;
  } else {
    html += `<p>🔍 Selecione um veículo para ver cargas compatíveis.</p>`;
  }
  html += `</div>`;

  // 🟥 Coluna 3: Rota montada
  html += `<div><h3>3️⃣ Rota planeada</h3>`;
  if (veiculoSelecionado) {
    const veiculo = game.vehicles.find(v => v.id === veiculoSelecionado);
    if (veiculo.entregas?.length > 0) {
      html += `<ul>`;
      veiculo.entregas.forEach(e => {
        html += `<li>${e.order.cargo} → ${e.order.to} (${e.order.weight}t)</li>`;
      });
      html += `</ul><br>
        <button onclick="despacharRotaPlaneada()">🚚 Despachar</button>`;
    } else {
      html += `<p>Nenhuma carga atribuída ainda.</p>`;
    }
  }
  html += `</div>`;

  html += `</div>`; // fim do layout principal
  container.innerHTML = html;
}

function selecionarVeiculoAvancado() {
  const select = document.getElementById("seletorVeiculo");
  veiculoSelecionado = parseInt(select.value);
  renderPlanejamentoAvancado();
}

function adicionarCargaPlaneada(orderId) {
  const ordem = game.orders.find(o => o.id === orderId);
  const veiculo = game.vehicles.find(v => v.id === veiculoSelecionado);

  if (!ordem || !veiculo) return;

  if (!veiculo.entregas) veiculo.entregas = [];

  const pesoAtual = veiculo.entregas.reduce((s, e) => s + e.order.weight, 0);
  if (pesoAtual + ordem.weight > veiculo.capacity) {
    notificar("❌ Capacidade excedida.");
    return;
  }

  const fromCoords = cityCoords[ordem.from];
  const toCoords = cityCoords[ordem.to];
  if (!fromCoords || !toCoords) {
    notificar("❌ Coordenadas não encontradas.");
    return;
  }

  const tempoMin = Math.round(ordem.distance / veiculo.speed * 45);
  veiculo.entregas.push({
    order: ordem,
    remainingTime: tempoMin,
    originalTime: tempoMin,
    fromCoords: { lat: fromCoords[0], lng: fromCoords[1] },
    toCoords: { lat: toCoords[0], lng: toCoords[1] }
  });

  ordem.assigned = true;
  notificar(`📦 Carga #${ordem.id} adicionada à rota de ${veiculo.name}`);
  renderPlanejamentoAvancado();
  atualizarMapa();
}

function despacharRotaPlaneada() {
  const veiculo = game.vehicles.find(v => v.id === veiculoSelecionado);
  if (!veiculo || !veiculo.entregas || veiculo.entregas.length === 0) {
    notificar("❌ Nenhuma carga atribuída.");
    return;
  }

  veiculo.status = "Em Rota";
  notificar(`🚚 ${veiculo.name} partiu com ${veiculo.entregas.length} entregas.`);
  veiculoSelecionado = null;
  renderDispatcherUI();
  atualizarMapa();
}

function calcularDistanciaEntre(cidade1, cidade2) {
  const a = cityCoords[cidade1];
  const b = cityCoords[cidade2];
  if (!a || !b) return Infinity;

  const R = 6371;
  const dLat = (b[0] - a[0]) * Math.PI / 180;
  const dLon = (b[1] - a[1]) * Math.PI / 180;
  const lat1 = a[0] * Math.PI / 180;
  const lat2 = b[0] * Math.PI / 180;

  const haversine = Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}
