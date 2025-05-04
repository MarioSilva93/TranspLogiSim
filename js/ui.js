function renderDispatcherUI() {
    if (currentTab === 'painel') {
      renderDashboardUI();
      return;
    }
  
    let html = "";
  
    if (currentTab === 'cargas') {
      html += `
      <div class="tabela-header">
        <h2>📦 Cargas Pendentes</h2>
      </div>
    `;

    
      const pendentes = game.orders.filter(o => !o.assigned);
      if (pendentes.length === 0) {
        html += `<p>✅ Nenhuma carga pendente.</p>`;
      } else {
        html += `
          <table class="tabela-cargas">
            <thead>
              <tr>
                <th>#</th>
                <th>Origem</th>
                <th>Destino</th>
                <th>Carga</th>
                <th>Peso</th>
                <th>Distância</th>
                <th>Prazo</th>
                <th>Atribuir</th>
              </tr>
            </thead>
            <tbody>
        `;
    
        pendentes.forEach(o => {
          html += `
            <tr>
              <td>#${o.id}</td>
              <td>${o.from}</td>
              <td>${o.to}</td>
              <td>${o.cargo}</td>
              <td>${o.weight}t</td>
              <td>${o.distance} km</td>
              <td>${o.deadline} h</td>
              <td>
                <select id="vehicleSelect_${o.id}">
                  <option value="">--Veículo--</option>
                  ${game.vehicles
                    .filter(v => v.status === "Disponível")
                    .map(v => `<option value="${v.id}">${v.name}</option>`)
                    .join('')}
                </select>
                <button onclick="assign(${o.id})">📤</button>
              </td>
            </tr>
          `;
        });
    
        html += `</tbody></table>`;
      }
    }
    
  
    if (currentTab === 'frota') {
      html += `<h2>🚚 Frota</h2>`;
    
      html += `
        <table class="tabela-cargas">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Capacidade</th>
              <th>Velocidade</th>
              <th>Status</th>
              <th>Manutenção</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
      `;
    
      game.vehicles.forEach(v => {
        const manut = v.manutencao ?? 100;
        html += `
          <tr>
            <td>${v.id}</td>
            <td>${v.name}</td>
            <td>${v.type}</td>
            <td>${v.capacity}t</td>
            <td>${v.speed} km/h</td>
            <td>${v.status}</td>
            <td>${manut}%</td>
            <td>
              ${manut < 100 && v.status === "Disponível"
                ? `<button onclick="enviarParaOficina(${v.id})">🔧 Reparar</button>`
                : "-"}
            </td>
          </tr>
        `;
      });
    
      html += `</tbody></table>`;
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
    
    if (currentTab === 'estatisticas') {
      html += `
        <h2>📈 Estatísticas</h2>
        <div class="card">
          <canvas id="graficoEntregas" height="120"></canvas>
        </div>
        <div class="card">
          <canvas id="graficoXP" height="120"></canvas>
        </div>`;
      setTimeout(renderGraficos, 100);
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
  
  