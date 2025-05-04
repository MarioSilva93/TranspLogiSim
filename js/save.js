/**
 * Gestão de múltiplos perfis de save
 */

function saveProfile(nome) {
    const dados = {
      game,
      gameClock
    };
    localStorage.setItem(`perfil_${nome}`, JSON.stringify(dados));
    notificar(`💾 Jogo salvo como perfil "${nome}"`);
  }
  
  function loadProfile(nome) {
    const dados = localStorage.getItem(`perfil_${nome}`);
    if (!dados) {
      notificar("Perfil não encontrado.");
      return;
    }
  
    const { game: g, gameClock: clk } = JSON.parse(dados);
    game = g;
    gameClock = clk;
    renderDispatcherUI();
    startClock();
    setup();
  }
  
  function listarPerfis() {
    const perfis = [];
    for (let key in localStorage) {
      if (key.startsWith("perfil_")) {
        perfis.push(key.replace("perfil_", ""));
      }
    }
    return perfis;
  }
  
  function apagarPerfil(nome) {
    localStorage.removeItem(`perfil_${nome}`);
    notificar(`Perfil "${nome}" apagado com sucesso.`);
  }

