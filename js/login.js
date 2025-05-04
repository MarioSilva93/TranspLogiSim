
function confirmarInicio() {
  const player = document.getElementById("playerName").value.trim();
  const company = document.getElementById("companyName").value.trim();
  if (!player || !company) {
    alert("Por favor preenche o nome do jogador e da empresa.");
    return;
  }
  localStorage.setItem("player_name", player);
  localStorage.setItem("empresa_nome", company);
  window.location.href = "escolher_cidade.html";
}
