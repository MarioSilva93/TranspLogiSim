/**
 * Controla o desgaste e manutenção dos veículos
 */

// Reduz o estado a cada entrega
function degradarVeiculo(vehicle) {
    if (!vehicle.manutencao) vehicle.manutencao = 100;
    vehicle.manutencao -= randInt(5, 15); // desgaste aleatório
  
    if (vehicle.manutencao < 0) vehicle.manutencao = 0;
    if (vehicle.manutencao < 30) {
      alert(`⚠️ O ${vehicle.name} está com baixa manutenção!`);
    }
  }
  
  // Envia para oficina (disponível no menu da frota)
  function enviarParaOficina(id) {
    const vehicle = game.vehicles.find(v => v.id === id);
  
    if (vehicle.status !== "Disponível") {
      alert("O veículo precisa estar parado para fazer manutenção.");
      return;
    }
  
    const custo = 1000 + (100 - (vehicle.manutencao || 100)) * 20;
  
    if (game.dinheiro < custo) {
      alert("Saldo insuficiente na empresa para reparação.");
      return;
    }
  
    game.dinheiro -= custo;
    vehicle.manutencao = 100;
  
    alert(`${vehicle.name} foi reparado por ${formatEuro(custo)}!`);
    renderDispatcherUI();
  }
  