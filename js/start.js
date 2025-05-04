function startGame() {
    const player = document.getElementById("playerName").value.trim();
    const company = document.getElementById("companyName").value.trim();
    const difficulty = document.getElementById("difficulty").value;
  
    if (!player || !company) {
      showNotification("Preenche todos os campos.");
      return;
    }
  
    sessionStorage.setItem("playerName", player);
    sessionStorage.setItem("companyName", company);
    sessionStorage.setItem("difficulty", difficulty);
  
    window.location.href = "game.html";
  }
  