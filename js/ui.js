function renderDispatcherUI() {
    if (currentTab === 'painel') {
      renderDashboardUI();
      return;
    }
  
    let html = "";
  
    if (currentTab === 'cargas') {
      html += `<h2>📦 Cargas Pendentes</h2>`;
      const pendentes = game.orders.filter(o => !o.assigned);
      if (pendentes.length === 0) {
        html += `<p>✅ Nenhuma carga pendente.</p>`;
      } else {
        pendentes.forEach(o => {
          html += `<div class="card">
            <strong>Carga #${o.id}</strong><br>
            De ${o.from} → ${o.to} - ${o.cargo} (${o.weight}t)<br>
            Distância: ${o.distance} km | Prazo: ${o.deadline}h<br>
            Atribuir a:
            <select id="vehicleSelect_${o.id}">
              <option value="">--Escolher Veículo--</option>
              ${game.vehicles.map(v => v.status === "Disponível" ? `<option value="${v.id}">${v.name}</option>` : "").join('')}
            </select>
            <button onclick="assign(${o.id})">📤 Atribuir</button>
          </div>`;
        });
      }
    }
  
    if (currentTab === 'frota') {
      html += `<h2>🚚 Frota</h2>`;
      game.vehicles.forEach(v => {
        const manut = v.manutencao ?? 100;
        html += `<div class="card">
          <strong>${v.name}</strong><br>
          Tipo: ${v.type}<br>
          Capacidade: ${v.capacity}t | Velocidade: ${v.speed}km/h<br>
          Status: ${v.status}<br>
          🛠️ Manutenção: ${manut}%<br>
          ${manut < 100 && v.status === "Disponível" ? `<button onclick="enviarParaOficina(${v.id})">🔧 Reparar</button>` : ""}
        </div>`;
      });
    }
  
    if (currentTab === 'loja') {
      html += `<h2>🛒 Loja de Veículos</h2>`;
      html += `<p>Saldo da empresa: ${formatEuro(game.dinheiro)}</p>`;
      lojaVeiculos.forEach((v, i) => {
        html += `<div class="card">
          <strong>${v.nome}</strong><br>
          Tipo: ${v.tipo}<br>
          Capacidade: ${v.capacidade}t<br>
          Velocidade: ${v.velocidade}km/h<br>
          Preço: ${formatEuro(v.preco)}<br>
          <button onclick="comprarVeiculo(${i})">Comprar</button>
        </div>`;
      });
    }
  
    if (currentTab === 'motoristas') {
      html += `<h2>👥 Motoristas</h2>`;
      if (!game.staff || game.staff.length === 0) {
        html += `<p>Nenhum motorista contratado.</p>`;
      } else {
        game.staff.forEach((m, i) => {
          html += `<div class="card">
            <strong>${m.nome}</strong><br>
            Experiência: ${m.experiencia}⭐<br>
            Salário: ${formatEuro(m.salario)}<br>
            Estado: ${m.ativo ? "Ativo" : "Inativo"}<br>
            ${m.ativo ? `<button onclick="demitirMotorista(${i})">Demitir</button>` : ""}
          </div>`;
        });
      }
      html += `<br><button onclick="contratarMotorista()">➕ Contratar Motorista</button>`;
    }
  
    if (currentTab === 'perfil') {
      const p = game.player;
      const percent = p.entregas === 0 ? 0 : Math.round((p.entregasNoPrazo / p.entregas) * 100);
      html += `<h2>👤 Perfil do Jogador</h2>`;
      html += `<div class="card">
        <strong>${p.nome}</strong><br>
        XP: ${game.xp} | Nível: ${game.nivel}<br>
        Entregas no prazo: ${p.entregasNoPrazo} / ${p.entregas} (${percent}%)<br>
        Total ganho: ${formatEuro(p.dinheiroTotal)}<br>
        Tempo jogado: ${formatarTempo(gameClock)}<br>
        ${game.salario > 0 && p.dinheiroTotal >= 50000 ? `<button onclick="comprarEmpresa()">🏢 Comprar empresa</button>` : ""}
      </div>`;
    }
  
    if (currentTab === 'saves') {
      const perfis = listarPerfis();
      html += `<h2>💾 Perfis</h2>`;
      perfis.forEach(nome => {
        html += `<div class="card">
          <strong>${nome}</strong><br>
          <button onclick="loadProfile('${nome}')">🔁 Carregar</button>
          <button onclick="apagarPerfil('${nome}')">🗑️ Apagar</button>
        </div>`;
      });
      html += `<br><input id="saveNome" placeholder="Nome do perfil">
      <button onclick="saveProfile(document.getElementById('saveNome').value)">Salvar</button>`;
    }
  
    document.getElementById("uiContainer").innerHTML = html;
  
    // Atualizar topbar
    document.getElementById("tempoJogo").textContent = formatarTempo(gameClock);
    document.getElementById("nomeEmpresa").textContent = game.company;
    document.getElementById("xpJogador").textContent = game.xp;
    document.getElementById("dinheiroEmpresa").textContent = formatEuro(game.dinheiro);
    document.getElementById("qtdFrota").textContent = game.vehicles.length;
    document.getElementById("qtdMotoristas").textContent = game.staff ? game.staff.filter(m => m.ativo).length : 0;

    }
  
  function renderDashboardUI() {
    const p = game.player;
    const percent = p.entregas === 0 ? 0 : Math.round((p.entregasNoPrazo / p.entregas) * 100);
  
    let html = `
      <div class="card">
        <h3>💼 Empresa</h3>
        <p>${game.company}</p>
        <p>Saldo: ${formatEuro(game.dinheiro)}</p>
      </div>
      <div class="card">
        <h3>👤 Jogador</h3>
        <p>${p.nome}</p>
        <p>XP: ${game.xp}</p>
        <p>Total ganho: ${formatEuro(p.dinheiroTotal)}</p>
      </div>
      <div class="card">
        <h3>📦 Entregas</h3>
        <p>No prazo: ${p.entregasNoPrazo}/${p.entregas}</p>
        <p>Pontualidade: ${percent}%</p>
      </div>
      <div class="card">
        <h3>🚚 Frota</h3>
        <p>Total: ${game.vehicles.length}</p>
        <p>Disponíveis: ${game.vehicles.filter(v => v.status === "Disponível").length}</p>
      </div>
    `;
  
    document.getElementById("uiContainer").innerHTML = html;
  
    // 🔧 Atualizar topbar COMPLETA
    document.getElementById("tempoJogo").textContent = formatarTempo(gameClock);
    document.getElementById("nomeEmpresa").textContent = game.company;
    document.getElementById("xpJogador").textContent = game.xp;
    document.getElementById("dinheiroEmpresa").textContent = formatEuro(game.dinheiro);
    document.getElementById("qtdFrota").textContent = game.vehicles.length;
    document.getElementById("qtdMotoristas").textContent = game.staff ? game.staff.filter(m => m.ativo).length : 0;
  }
  
  