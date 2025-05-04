/**
 * Renderiza os gráficos de estatísticas usando Chart.js
 */
function renderGraficos() {
    if (!game.player.historico || game.player.historico.length === 0) {
      return;
    }
  
    const ctx1 = document.getElementById("graficoEntregas").getContext("2d");
    const ctx2 = document.getElementById("graficoXP").getContext("2d");
  
    const blocos = game.player.historico.map(e => `🕒 ${e.bloco * 30}min`);
    const entregas = game.player.historico.map(e => e.entregas);
    const xp = game.player.historico.map(e => e.xp);
  
    new Chart(ctx1, {
      type: 'bar',
      data: {
        labels: blocos,
        datasets: [{
          label: 'Entregas por tempo',
          data: entregas,
          backgroundColor: '#00bcd4'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  
    new Chart(ctx2, {
      type: 'line',
      data: {
        labels: blocos,
        datasets: [{
          label: 'XP acumulado',
          data: xp,
          fill: false,
          borderColor: '#4caf50',
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }
  