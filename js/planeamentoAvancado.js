// Evitar declaração duplicada
window.veiculoSelecionado = window.veiculoSelecionado || null;
window.cargasSelecionadas = window.cargasSelecionadas || [];

function abrirPlaneamentoAvancado() {
  const html = `
    <h2>🚛 Planeamento de Carga Avançado</h2>
    <p>Selecione um veículo e adicione cargas que ele possa levar.</p>
    <label>Veículo:</label>
    <select id="selectVeiculo">
      <option value="">-- Escolha um veículo --</option>
      ${game.vehicles
        .filter(v => v.status === "Disponível")
        .map(v => `<option value="${v.id}">${v.name}</option>`)
        .join("")}
    </select>
    <div id="cargasPlaneadas"></div>
    <button onclick="confirmarPlaneamento()">✅ Despachar</button>
    <button onclick="renderDispatcherUI()">🔙 Cancelar</button>
  `;
  document.getElementById("uiContainer").innerHTML = html;

  document.getElementById("selectVeiculo").addEventListener("change", function () {
    window.veiculoSelecionado = parseInt(this.value);
    window.cargasSelecionadas = [];
    mostrarCargasDisponiveis();
  });
}

function mostrarCargasDisponiveis() {
  const div = document.getElementById("cargasPlaneadas");
  if (!veiculoSelecionado) return (div.innerHTML = "<p>Escolha um veículo acima.</p>");

  const veiculo = game.vehicles.find(v => v.id === veiculoSelecionado);
  const cargasDisponiveis = game.orders.filter(
    o =>
      !o.assigned &&
      o.from === veiculo.location.nome && // local atual do veículo
      o.weight + cargasSelecionadas.reduce((t, c) => t + c.weight, 0) <= veiculo.capacity
  );

  let html = `<h3>Selecionar Cargas:</h3>`;
  if (cargasDisponiveis.length === 0) {
    html += "<p>❌ Nenhuma carga disponível neste local ou acima da capacidade.</p>";
  } else {
    html += cargasDisponiveis
      .map(
        (c) => `
      <div class="card">
        <strong>Carga #${c.id}</strong><br>
        Para: ${c.to} | ${c.cargo} (${c.weight}t)<br>
        <button onclick="adicionarCarga(${c.id})">➕ Adicionar</button>
      </div>
    `
      )
      .join("");
  }

  if (cargasSelecionadas.length > 0) {
    html += `<h3>🧾 Cargas Selecionadas:</h3><ul>`;
    cargasSelecionadas.forEach((c) => {
      html += `<li>#${c.id} → ${c.to} (${c.weight}t)</li>`;
    });
    html += `</ul>`;
  }

  div.innerHTML = html;
}

function adicionarCarga(id) {
  const carga = game.orders.find(o => o.id === id);
  if (!carga) return;

  carga.assigned = true;
  cargasSelecionadas.push(carga);
  mostrarCargasDisponiveis();
}

function confirmarPlaneamento() {
  const veiculo = game.vehicles.find(v => v.id === veiculoSelecionado);
  if (!veiculo || cargasSelecionadas.length === 0) {
    alert("Selecione um veículo e pelo menos uma carga.");
    return;
  }

  const entrega = {
    pedidos: [...cargasSelecionadas],
    rota: cargasSelecionadas.map(c => c.to),
    atual: 0,
    tempoTotal: 0
  };

  veiculo.delivery = entrega;
  veiculo.status = "Entregando múltiplas cargas";
  window.cargasSelecionadas = [];
  renderDispatcherUI();
  atualizarMapa();
}
