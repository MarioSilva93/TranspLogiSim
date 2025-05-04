
let tempo = 0;
let saldo = 3000;
let xp = 0;
let entregas = [];
let veiculos = [];

window.addEventListener("load", () => {
  initMapa();
  carregarJogo();
  if (veiculos.length === 0) inicializarVeiculos();
  gerarEntregas(5);
  render();
  setInterval(() => {
    tempo++;
    document.getElementById("tempo").textContent = tempo;
  }, 1000);
});

function inicializarVeiculos() {
  veiculos = [
    { id: 1, nome: "Carrinha A", livre: true, combustivel: 100, manuten: 100 }
  ];
  veiculos.forEach(v => atualizarMarcador(v.nome, [46.9481, 7.4474]));
}

function gerarEntregas(qtd) {
  const cidades = {
    "Bern": [46.9481, 7.4474],
    "Zurique": [47.3769, 8.5417],
    "Genebra": [46.2044, 6.1432],
    "Lausanne": [46.5197, 6.6323],
    "Lucerna": [47.0502, 8.3093]
  };
  const nomes = Object.keys(cidades);

  for (let i = 0; i < qtd; i++) {
    let from = nomes[Math.floor(Math.random() * nomes.length)];
    let to;
    do {
      to = nomes[Math.floor(Math.random() * nomes.length)];
    } while (to === from);

    entregas.push({
      id: i + 1,
      from,
      to,
      coords: cidades[to],
      peso: Math.floor(Math.random() * 10) + 1
    });
  }
}

function render() {
  renderEntregas();
  renderVeiculos();
  document.getElementById("saldo").textContent = saldo + " €";
  document.getElementById("xp").textContent = xp;
}

function renderEntregas() {
  const painel = document.getElementById("painel-entregas");
  painel.innerHTML = "<h3>Entregas Disponíveis</h3>";
  entregas.forEach(e => {
    const div = document.createElement("div");
    div.className = "entrega-item";
    div.innerHTML = `
      <strong>${e.from} → ${e.to}</strong><br>
      Peso: ${e.peso}t
      <br><button onclick="atribuirEntrega(${e.id})">Atribuir</button>
    `;
    painel.appendChild(div);
  });
}

function renderVeiculos() {
  const painel = document.getElementById("painel-veiculos");
  painel.innerHTML = "<h3>Frota</h3>";
  veiculos.forEach(v => {
    const div = document.createElement("div");
    div.className = "veiculo-item";
    div.innerHTML = `${v.nome} - ${v.livre ? "🟢 Livre" : "🔴 Ocupado"} | Comb: ${v.combustivel}% | Man: ${v.manuten}%` +
`<br><button onclick="abastecerVeiculo(${v.id})">⛽ Abastecer (10€)</button>` +
`<button onclick="repararVeiculo(${v.id})">🔧 Reparar (100€)</button>`;
    painel.appendChild(div);
  });
}

function atribuirEntrega(id) {
  const entrega = entregas.find(e => e.id === id);
  const veiculo = veiculos.find(v => v.livre && v.combustivel > 10);
  if (!veiculo) return notificar("Sem veículos livres ou com combustível suficiente!");

  veiculo.livre = false;
  veiculo.combustivel -= 10;
  veiculo.manuten -= 5;

  moverPara(veiculo.nome, entrega.coords, () => {
    saldo += entrega.peso * 100;
    xp += entrega.peso * 2;
    veiculo.livre = true;
    render();
    notificar(`Entrega concluída por ${veiculo.nome}`);
  });

  render();
}

function comprarVeiculo() {
  if (saldo < 2000) return notificar("Saldo insuficiente!");
  const id = veiculos.length + 1;
  veiculos.push({ id, nome: "Carrinha " + String.fromCharCode(64 + id), livre: true, combustivel: 100, manuten: 100 });
  saldo -= 2000;
  render();
}

function guardarJogo() {
  localStorage.setItem("transp_save", JSON.stringify({ tempo, saldo, xp, veiculos }));
  notificar("Jogo guardado!");
}

function carregarJogo() {
  const save = localStorage.getItem("transp_save");
  if (save) {
    const data = JSON.parse(save);
    tempo = data.tempo;
    saldo = data.saldo;
    xp = data.xp;
    veiculos = data.veiculos || [];
    veiculos.forEach(v => atualizarMarcador(v.nome, [46.9481, 7.4474]));
  }
}

function abastecerVeiculo(id) {
  const veiculo = veiculos.find(v => v.id === id);
  if (!veiculo) return notificar("Veículo não encontrado", "erro");
  if (saldo < 10) return notificar("Saldo insuficiente!", "erro");
  veiculo.combustivel = 100;
  saldo -= 10;
  notificar("Veículo abastecido com sucesso!", "sucesso");
  render();
}

function repararVeiculo(id) {
  const veiculo = veiculos.find(v => v.id === id);
  if (!veiculo) return notificar("Veículo não encontrado", "erro");
  if (saldo < 100) return notificar("Saldo insuficiente!", "erro");
  veiculo.manuten = 100;
  saldo -= 100;
  notificar("Veículo reparado com sucesso!", "sucesso");
  render();
}
