// Lista de países e suas cidades principais
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
        <select id="cidadeSelect"><option value="">🏙️ Selecione uma cidade</option></select><br><br>
        <button onclick="confirmarPerfil()">✅ Criar Perfil</button>
      </div>
    `;
    document.getElementById("uiContainer").innerHTML = html;
  }
  
  
  // Atualiza cidades conforme país
  function atualizarCidades() {
    const pais = document.getElementById("paisSelect").value;
    const cidades = paisesECidades[pais] || [];
    const cidadeSelect = document.getElementById("cidadeSelect");
  
    cidadeSelect.innerHTML = `<option value="">🏙️ Selecione uma cidade</option>` +
      cidades.map(c => `<option>${c}</option>`).join('');
  }
  
  // Finaliza criação do perfil
  function confirmarPerfil() {
    const nome = document.getElementById("playerName").value.trim();
    const pais = document.getElementById("paisSelect").value;
    const cidade = document.getElementById("cidadeSelect").value;
    const empresa = document.getElementById("empresaSelect").value;
  
    if (!nome || !pais || !cidade || !empresa) {
      notificar("❗ Por favor, preencha todos os campos.");
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
      nivel: 1,
      dinheiro: 10000,
      vehicles: [],
      staff: [],
      orders: [],
      entregasCompletas: 0
    };
  
    startClock();
    gerarPedidos(10);
    renderDispatcherUI();
    notificar(`👋 Bem-vindo, ${nome}! Você foi contratado pela ${empresa} em ${cidade}.`);
  }
  
  