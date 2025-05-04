const empresasPorPais = {
    "Suíça": ["DPD", "Planzer", "Galliker"],
    "Alemanha": ["Dachser", "DB Schenker", "Hermes"],
    "França": ["La Poste", "Chronopost", "Geodis"],
    "Espanha": ["SEUR", "Correos Express", "MRW"],
    "Portugal": ["CTT Expresso", "Nacex", "Torrestir"]
  };  
  
  function renderSelecaoEmpresa(pais) {
    const empresas = empresasPorPais[pais] || ["Empresa Genérica"];
  
    let html = `
      <div class="inicio">
        <h2>🏢 Selecione uma Empresa de Transporte</h2>
        <p>Baseado em: <strong>${pais}</strong></p>
        <select id="companySelect">
          ${empresas.map(e => `<option>${e}</option>`).join('')}
        </select><br><br>
        <button onclick="applyToJob()">📄 Trabalhar nessa empresa</button>
      </div>
    `;
  
    document.getElementById("uiContainer").innerHTML = html;
  }
  
  function applyToJob() {
    const empresa = document.getElementById("companySelect").value;
    game.company = empresa;
    notificar(`📦 Você foi contratado pela ${empresa}!`, "sucesso");
    startDispatcherWork(empresa);
  }
  