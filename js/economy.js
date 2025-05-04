/**
 * Pagamento de salário a cada X minutos de jogo
 */
function processSalario() {
    const minutosDesdeUltimo = gameClock - game.ultimoPagamento;
  
    if (minutosDesdeUltimo >= 120) { // A cada 2 horas de jogo
      game.ultimoPagamento = gameClock;
  
      if (game.dinheiro >= game.salario) {
        game.dinheiro -= game.salario;
        game.player.dinheiroTotal += game.salario;
  
        notificar(`💶 Salário pago: ${formatEuro(game.salario)} (${game.nivel})`);
      } else {
        notificar("⚠️ A empresa não tem saldo suficiente para pagar o salário!");
      }
  
      renderDispatcherUI();
    }
  }
  
  /**
   * Dá XP ao jogador após entrega e verifica promoções
   */
  function completarEntregaComXP(foiNoPrazo) {
    if (foiNoPrazo) {
      game.score += 10;
      game.xp += 20;
      notificar("✅ Entrega no prazo! (+20 XP)");
      checkPromocao();
    } else {
      game.score -= 10;
      game.xp += 5;
      notificar("⚠️ Entrega com atraso. (+5 XP)");
      checkPromocao();
    }
  }
  
  /**
   * Verifica promoções com base no XP atual
   */
  function checkPromocao() {
    const xp = game.xp;
  
    if (xp >= 500 && game.nivel !== "Chefe de Tráfego") {
      game.nivel = "Chefe de Tráfego";
      game.salario = 5000;
      notificar("🎉 Promoção: Chefe de Tráfego!");
    } else if (xp >= 250 && game.nivel === "Pleno") {
      game.nivel = "Sénior";
      game.salario = 3600;
      notificar("🔼 Promoção: Dispatcher Sénior!");
    } else if (xp >= 100 && game.nivel === "Dispatcher Júnior") {
      game.nivel = "Pleno";
      game.salario = 2800;
      notificar("🔼 Promoção: Dispatcher Pleno!");
    }
  }
  