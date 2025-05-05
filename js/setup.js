function startNewGame() {
    const player = document.getElementById("playerName").value.trim();
    const company = document.getElementById("companyName").value.trim();
  
    if (!player || !company) {
      alert("Preenche os dois campos!");
      return;
    }
  
    sessionStorage.setItem("playerName", player);
    sessionStorage.setItem("companyName", company);
  
    localStorage.setItem("saveData", JSON.stringify({
      player,
      company,
      vans: [],
      deliveries: [],
      stats: { xp: 0, vansBought: 3, totalDeliveries: 0 },
      money: 10000
    }));
  
    window.location.href = "index.html";
  }
  
  function continueGame() {
    const saved = localStorage.getItem("saveData");
    if (!saved) {
      alert("Nenhum jogo salvo. Começa um novo.");
      return;
    }
  
    const data = JSON.parse(saved);
    sessionStorage.setItem("playerName", data.player);
    sessionStorage.setItem("companyName", data.company);
  
    window.location.href = "index.html";
  }
  
  function resetProgress() {
    if (confirm("Tens a certeza que queres apagar todo o progresso?")) {
      localStorage.removeItem("saveData");
      alert("Progresso apagado com sucesso!");
    }
  }
  