
function lerp(a, b, t) {
  return a + (b - a) * t;
}

function notificar(msg, tipo = 'info') {
  const container = document.getElementById('notificacoes');
  if (!container) return console.warn("Elemento #notificacoes não encontrado!");
  const toast = document.createElement('div');
  toast.className = 'toast ' + tipo;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}
