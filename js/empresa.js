/**
 * Transição de empregado para dono
 */

function comprarEmpresa() {
    if (game.player.dinheiroTotal >= 50000) {
      if (!confirm("Pretende comprar a sua própria empresa por €50.000?")) return;
  
      game.player.dinheiroTotal -= 50000;
      game.company = game.player.nome + " Transportes";
      game.salario = 0;
      alert("🎉 Agora és o dono da empresa!");
      renderDispatcherUI();
    } else {
      alert("💰 Ainda não tens dinheiro suficiente para comprar a empresa!");
    }
  }
  