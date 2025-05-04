const paisesECidades = {
    "Suíça": ["Zurique", "Genebra", "Lausana", "Basileia", "Berna", "Uster"],
    "Alemanha": ["Berlim", "Munique", "Hamburgo", "Frankfurt", "Colónia"],
    "França": ["Paris", "Marselha", "Lyon", "Toulouse", "Nice"],
    "Espanha": ["Madrid", "Barcelona", "Valência", "Sevilha", "Bilbau"],
    "Portugal": ["Lisboa", "Porto", "Coimbra", "Braga", "Faro"]
  };
  
  function renderCriacaoPerfil() {
    let html = `
      <div class="inicio">
        <h2>🎮 Bem-vindo ao Simulador de Logística</h2>
        <p>Digite seu nome e escolha uma localização inicial:</p>
        <input id="playerName" placeholder="Seu nome" /><br><br>
  
        <select id="paisSelect" onchange="atualizarCidades()">
          <option value="">🌍 Selecione um país</option>
          ${Object.keys(paisesECidades).map(p => `<option>${p}</option>`).join('')}
        </select><br><br>
  
        <select id="cidadeSelect">
          <option value="">🏙️ Selecione uma cidade</option>
        </select><br><br>
  
        <div id="empresaContainer">
          <select id="empresaSelect" disabled>
            <option value="">🏢 Selecione uma empresa</option>
          </select>
        </div><br>
  
        <button onclick="confirmarPerfil()">✅ Criar Perfil</button>
      </div>
    `;
    document.getElementById("uiContainer").innerHTML = html;
  }
  
  function atualizarCidades() {
    const pais = document.getElementById("paisSelect").value;
    const cidades = paisesECidades[pais] || [];
    const empresas = empresasPorPais[pais] || [];
  
    const cidadeSelect = document.getElementById("cidadeSelect");
    cidadeSelect.innerHTML = `<option value="">🏙️ Selecione uma cidade</option>` +
      cidades.map(c => `<option>${c}</option>`).join('');
  
    const empresaSelect = document.getElementById("empresaSelect");
    empresaSelect.disabled = false;
    empresaSelect.innerHTML = `<option value="">🏢 Selecione uma empresa</option>` +
      empresas.map(e => `<option>${e}</option>`).join('');
  }
  
  function confirmarPerfil() {
    const nome = document.getElementById("playerName").value.trim();
    const pais = document.getElementById("paisSelect").value;
    const cidade = document.getElementById("cidadeSelect").value;
    const empresa = document.getElementById("empresaSelect").value;
  
    if (!nome || !pais || !cidade || !empresa) {
      notificar("❗ Por favor, preencha todos os campos.", "erro");
      return;
    }
  
    game = {
      player: {
        nome,
        entregas: 0,
        entregasNoPrazo: 0,
        dinheiroTotal: 0
      },
      company: empresa,
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
          status: 'Disponível', entregas: [], location: cidade, name: 'Carrinha 1'
        },
        {
          id: 2, type: 'Camião', capacity: 10, speed: 80,
          status: 'Disponível', entregas: [], location: cidade, name: 'Camião 2'
        }
      ],
      staff: [],
      orders: []
    };
  
    startClock();
    generateOrders(10);
    renderDispatcherUI();
    setup();
    focarMapaNaCidade(cidade); // NOVO: centraliza no mapa
  
    notificar(`👋 Bem-vindo, ${nome}! Você foi contratado pela ${empresa} em ${cidade}.`, "sucesso");
  }
  