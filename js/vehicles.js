// Lista da loja de veículos
const lojaVeiculos = [
    { nome: "Sprinter 315 CDI", tipo: "Carrinha", capacidade: 2, velocidade: 70, preco: 18000 },
    { nome: "MAN TGS 18.500", tipo: "Camião", capacidade: 10, velocidade: 80, preco: 45000 },
    { nome: "Iveco Daily", tipo: "Carrinha", capacidade: 3, velocidade: 60, preco: 15000 },
    { nome: "Volvo FH16", tipo: "Camião", capacidade: 12, velocidade: 85, preco: 52000 }
  ];
  
  /**
   * Compra um veículo da loja
   */
  function comprarVeiculo(index) {
    const v = lojaVeiculos[index];
    if (game.dinheiro < v.preco) {
      notificar("❌ Dinheiro insuficiente para comprar este veículo!");
      return;
    }
  
    const novoId = game.vehicles.length + 1;
    const novoVeiculo = {
      id: novoId,
      type: v.tipo,
      capacity: v.capacidade,
      speed: v.velocidade,
      status: 'Disponível',
      delivery: null,
      location: 'Uster',
      name: `${v.nome} #${novoId}`
    };
  
    game.vehicles.push(novoVeiculo);
    game.dinheiro -= v.preco;
    notificar(`✅ Veículo ${v.nome} comprado com sucesso!`);
    renderDispatcherUI();
  }
  
  /**
   * Permite renomear um veículo na frota
   */
  function renomearVeiculo(id, novoNome) {
    const v = game.vehicles.find(v => v.id === id);
    if (v) {
      v.name = novoNome;
      renderDispatcherUI();
    }
  }
  