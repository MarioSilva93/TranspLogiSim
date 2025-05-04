/**
 * Gestão de motoristas
 */

function contratarMotorista() {
    const nomes = ["Carlos", "Joana", "Miguel", "Sofia", "Tiago", "Rita"];
    const nome = nomes[randInt(0, nomes.length - 1)];
  
    if (!game.staff) game.staff = [];
    game.staff.push({
      nome,
      salario: 1500,
      experiencia: randInt(1, 5),
      ativo: true
    });
  
    alert(`👤 ${nome} foi contratado!`);
    renderDispatcherUI();
  }
  
  function demitirMotorista(index) {
    if (confirm("Deseja mesmo demitir este motorista?")) {
      game.staff[index].ativo = false;
      renderDispatcherUI();
    }
  }

  