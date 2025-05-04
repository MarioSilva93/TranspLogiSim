/**
 * Interpolação linear entre dois valores.
 * Usado para mover veículos no mapa.
 */
function lerp(start, end, amt) {
    return start + (end - start) * amt;
  }
  
  /**
   * Formata valores monetários para euro (€)
   */
  function formatEuro(valor) {
    if (typeof valor !== "number" || isNaN(valor)) valor = 0;
    return `€${valor.toLocaleString('pt-PT', { minimumFractionDigits: 0 })}`;
  }
  
  
  /**
   * Formata tempo em minutos para "xh ymin"
   */
  function formatarTempo(minutos) {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return `${h}h ${m}min`;
  }
  
  /**
   * Gera número inteiro aleatório entre min e max (inclusive)
   */
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  function notificar(mensagem, tipo = "info", duracao = 4000) {
    const container = document.getElementById("notificacoes");
    const toast = document.createElement("div");
    toast.className = `toast ${tipo}`;
    toast.innerHTML = mensagem;
  
    container.appendChild(toast);
  
    setTimeout(() => {
      toast.remove();
    }, duracao);
  }
  