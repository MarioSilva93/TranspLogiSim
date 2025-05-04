function renderXPChart() {
  const ctx = document.getElementById('graficoXP');
  if (!ctx) return;

  const data = {
    labels: ['XP Atual', 'XP Próximo Nível'],
    datasets: [{
      label: 'Experiência',
      data: [game.xp, Math.max(100, 100 + game.nivel * 50)],
      backgroundColor: ['#00bcd4', '#555']
    }]
  };

  new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
      plugins: {
        legend: { display: false }
      },
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function renderEntregasChart() {
  const ctx = document.getElementById('graficoEntregas');
  if (!ctx) return;

  const noPrazo = game.player.entregasNoPrazo || 0;
  const atrasadas = (game.player.entregas || 0) - noPrazo;

  const data = {
    labels: ['No Prazo', 'Atrasadas'],
    datasets: [{
      label: 'Entregas',
      data: [noPrazo, atrasadas],
      backgroundColor: ['#4caf50', '#e53935']
    }]
  };

  new Chart(ctx, {
    type: 'doughnut',
    data: data,
    options: {
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#ccc' }
        }
      }
    }
  });
}
