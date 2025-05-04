
function lerp(a, b, t) {
  return a + (b - a) * t;
}

function notificar(msg, tipo = 'info') {
  const container = document.getElementById('notificacoes');
  const toast = document.createElement('div');
  toast.className = 'toast ' + tipo;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}
