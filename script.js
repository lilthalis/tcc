const entradaNome = document.getElementById('entradaNome');
const entradaQtd = document.getElementById('entradaQtd');
const saidaNome = document.getElementById('saidaNome');
const saidaQtd = document.getElementById('saidaQtd');
const saidaPessoa = document.getElementById('saidaPessoa');
const qtdDisponivel = document.getElementById('qtdDisponivel');
const pesquisa = document.getElementById('pesquisa');
const tabelaEstoque = document.getElementById('tabelaEstoque');
const tabelaHistorico = document.getElementById('tabelaHistorico');
const msgEntrada = document.getElementById('msgEntrada');
const msgSaida = document.getElementById('msgSaida');

let estoque = JSON.parse(localStorage.getItem('estoque')) || {
  "Caneta Azul": 50,
  "LÃ¡pis HB": 100,
  "Borracha Branca": 45,
  "Caderno UniversitÃ¡rio": 20,
  "Papel A4 (Pacote)": 10,
  "RÃ©gua 30cm": 15,
  "Tesoura Escolar": 12,
  "Cola BastÃ£o": 30,
  "Grampeador": 8,
  "Clips (Caixa)": 100,
  "Pasta Suspensa": 40,
  "Calculadora": 5,
  "Estojo": 15,
  "Marcador de Texto": 25,
  "Apontador": 60
};
let historico = JSON.parse(localStorage.getItem('historico')) || [
  { tipo: "Entrada", item: "Caneta Azul", quantidade: 10, pessoa: "Estoque Central", data: "04/02/2026", hora: "10:00:00" },
  { tipo: "Entrada", item: "Papel A4 (Pacote)", quantidade: 5, pessoa: "Estoque Central", data: "04/02/2026", hora: "10:05:00" },
  { tipo: "SaÃ­da", item: "LÃ¡pis HB", quantidade: 2, pessoa: "JoÃ£o Silva", data: "04/02/2026", hora: "14:30:00" },
  { tipo: "SaÃ­da", item: "Borracha Branca", quantidade: 1, pessoa: "Maria Souza", data: "04/02/2026", hora: "15:00:00" },
  { tipo: "Entrada", item: "RÃ©gua 30cm", quantidade: 15, pessoa: "Estoque Central", data: "04/02/2026", hora: "15:10:00" },
  { tipo: "Entrada", item: "Tesoura Escolar", quantidade: 12, pessoa: "Estoque Central", data: "04/02/2026", hora: "15:15:00" },
  { tipo: "Entrada", item: "Cola BastÃ£o", quantidade: 30, pessoa: "Estoque Central", data: "04/02/2026", hora: "15:20:00" },
  { tipo: "Entrada", item: "Grampeador", quantidade: 8, pessoa: "Estoque Central", data: "04/02/2026", hora: "15:25:00" },
  { tipo: "Entrada", item: "Clips (Caixa)", quantidade: 100, pessoa: "Estoque Central", data: "04/02/2026", hora: "15:30:00" },
  { tipo: "Entrada", item: "Pasta Suspensa", quantidade: 40, pessoa: "Estoque Central", data: "04/02/2026", hora: "15:35:00" },
  { tipo: "Entrada", item: "Calculadora", quantidade: 5, pessoa: "Estoque Central", data: "04/02/2026", hora: "15:40:00" },
  { tipo: "Entrada", item: "Estojo", quantidade: 15, pessoa: "Estoque Central", data: "04/02/2026", hora: "15:45:00" },
  { tipo: "Entrada", item: "Marcador de Texto", quantidade: 25, pessoa: "Estoque Central", data: "04/02/2026", hora: "15:50:00" },
  { tipo: "Entrada", item: "Apontador", quantidade: 60, pessoa: "Estoque Central", data: "04/02/2026", hora: "15:55:00" }
];

let paginaAtual = 1;
let paginaEstoqueAtual = 1;
const itensPorPagina = 5;

function salvarDados() {
  localStorage.setItem('estoque', JSON.stringify(estoque));
  localStorage.setItem('historico', JSON.stringify(historico));
}

document.addEventListener('DOMContentLoaded', () => {
  atualizarTabela();
  atualizarSaidaSelect();
  atualizarHistorico();
});

function mostrarMensagem(elemento, texto, tipo) {
  elemento.textContent = texto;
  elemento.className = `msg-container msg-${tipo}`;
  setTimeout(() => {
    elemento.className = 'msg-container';
    elemento.textContent = '';
  }, 3000);
}

function adicionarItem() {
  const nome = entradaNome.value.trim();
  const qtd = Number(entradaQtd.value);

  if (!nome || qtd <= 0) {
    return mostrarMensagem(msgEntrada, "Preencha corretamente!", "error");
  }

  estoque[nome] = (estoque[nome] || 0) + qtd;

  
  const agora = new Date();
  historico.push({
    tipo: "Entrada",
    item: nome,
    quantidade: qtd,
    pessoa: "Entrada Manual",
    data: agora.toLocaleDateString('pt-BR'),
    hora: agora.toLocaleTimeString('pt-BR')
  });

  salvarDados();
  atualizarTabela();
  atualizarSaidaSelect();
  atualizarQtdDisponivelSaida();
  atualizarHistorico();
  entradaNome.value = "";
  entradaQtd.value = "";
  mostrarMensagem(msgEntrada, "Item adicionado!", "success");
}

function removerItem() {
  const nome = saidaNome.value;
  const qtd = Number(saidaQtd.value);
  const pessoa = saidaPessoa.value.trim();

  if (!nome || qtd <= 0 || !pessoa) {
    return mostrarMensagem(msgSaida, "Preencha todos os campos!", "error");
  }

  if (!estoque[nome] || estoque[nome] < qtd) {
    return mostrarMensagem(msgSaida, "Quantidade insuficiente!", "error");
  }

  estoque[nome] -= qtd;
  if (estoque[nome] === 0) delete estoque[nome];

  
  const agora = new Date();
  historico.push({
    tipo: "SaÃ­da",
    item: nome,
    quantidade: qtd,
    pessoa: pessoa,
    data: agora.toLocaleDateString('pt-BR'),
    hora: agora.toLocaleTimeString('pt-BR')
  });

  salvarDados();
  mostrarMensagem(msgSaida, `Retirado por: ${pessoa}`, "success");
  atualizarTabela();
  atualizarSaidaSelect();
  atualizarQtdDisponivelSaida();
  atualizarHistorico();

  saidaNome.value = "";
  saidaQtd.value = "";
  saidaPessoa.value = "";
  qtdDisponivel.innerHTML = "";
}

function atualizarTabela(filtro = "") {
  tabelaEstoque.innerHTML = "";
  const filtroLower = filtro.toLowerCase();
  
  
  const itensFiltrados = Object.keys(estoque).filter(item => 
    item.toLowerCase().includes(filtroLower)
  );

  const containerPaginacao = document.getElementById("paginacaoEstoque");
  if (itensFiltrados.length === 0) {
    tabelaEstoque.innerHTML = '<tr><td colspan="2" style="text-align:center; color:#999;">Nenhum item no estoque</td></tr>';
    if (containerPaginacao) containerPaginacao.style.display = 'none';
    return;
  }

  if (containerPaginacao) containerPaginacao.style.display = 'flex';

  const totalPaginas = Math.ceil(itensFiltrados.length / itensPorPagina) || 1;
  if (paginaEstoqueAtual > totalPaginas) paginaEstoqueAtual = totalPaginas;

  const inicio = (paginaEstoqueAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const itensPaginados = itensFiltrados.slice(inicio, fim);

  itensPaginados.forEach(item => {
    tabelaEstoque.innerHTML += `
      <tr>
        <td>${item}</td>
        <td>${estoque[item]}</td>
      </tr>
    `;
  });

  if (itensFiltrados.length === 0) {
    tabelaEstoque.innerHTML = '<tr><td colspan="2" style="text-align:center; color:#999;">Nenhum item no estoque</td></tr>';
  }

  
  document.getElementById("paginaIndicadorEstoque").innerText = `PÃ¡gina ${paginaEstoqueAtual} de ${totalPaginas}`;
  document.getElementById("btnAnteriorEstoque").disabled = (paginaEstoqueAtual === 1);
  document.getElementById("btnProximaEstoque").disabled = (paginaEstoqueAtual >= totalPaginas);
}

function filtrarEstoque() {
  paginaEstoqueAtual = 1; 
  const filtro = pesquisa.value.trim();
  atualizarTabela(filtro);
}

function paginaAnteriorEstoque() {
  if (paginaEstoqueAtual > 1) {
    paginaEstoqueAtual--;
    atualizarTabela(pesquisa.value.trim());
  }
}

function proximaPaginaEstoque() {
  const filtro = pesquisa.value.trim();
  const itensFiltrados = Object.keys(estoque).filter(item => 
    item.toLowerCase().includes(filtro.toLowerCase())
  );
  const totalPaginas = Math.ceil(itensFiltrados.length / itensPorPagina);

  if (paginaEstoqueAtual < totalPaginas) {
    paginaEstoqueAtual++;
    atualizarTabela(filtro);
  }
}

function atualizarHistorico() {
  tabelaHistorico.innerHTML = "";
  const containerPaginacao = document.getElementById("paginacaoHistorico");

  if (historico.length === 0) {
    tabelaHistorico.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#999;">Nenhuma movimentaÃ§Ã£o registrada</td></tr>';
    if (containerPaginacao) containerPaginacao.style.display = 'none';
    return;
  }

  if (containerPaginacao) containerPaginacao.style.display = 'flex';
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const totalPaginas = Math.ceil(historico.length / itensPorPagina);

  
  const historicoOrdenado = [...historico].reverse();
  const itensExibidos = historicoOrdenado.slice(inicio, fim);

  itensExibidos.forEach((mov) => {
    const corTipo = mov.tipo === "Entrada" ? "color: #188038;" : "color: #d93025;";
    tabelaHistorico.innerHTML += `
      <tr>
        <td style="${corTipo} font-weight: bold;">${mov.tipo}</td>
        <td>${mov.item}</td>
        <td>${mov.quantidade}</td>
        <td>${mov.pessoa}</td>
        <td style="font-size: 11px;">${mov.data} ${mov.hora}</td>
      </tr>
    `;
  });

  document.getElementById('paginaIndicador').textContent = `PÃ¡gina ${paginaAtual} de ${totalPaginas}`;
  document.getElementById('btnAnterior').disabled = paginaAtual === 1;
  document.getElementById('btnProxima').disabled = paginaAtual === totalPaginas || totalPaginas === 0;
}

function paginaAnterior() {
  if (paginaAtual > 1) {
    paginaAtual--;
    atualizarHistorico();
  }
}

function proximaPagina() {
  const totalPaginas = Math.ceil(historico.length / itensPorPagina);
  if (paginaAtual < totalPaginas) {
    paginaAtual++;
    atualizarHistorico();
  }
}

function atualizarSaidaSelect() {
  const itemSelecionado = saidaNome.value;
  saidaNome.innerHTML = '<option value="">Selecione um item...</option>';
  
  for (let item in estoque) {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    saidaNome.appendChild(option);
  }
  
  if (estoque[itemSelecionado]) {
    saidaNome.value = itemSelecionado;
  } else {
    qtdDisponivel.innerHTML = "";
  }
}

function atualizarQtdDisponivelSaida() {
  const item = saidaNome.value;
  if (item && estoque[item]) {
    qtdDisponivel.innerHTML = `DisponÃ­vel: ${estoque[item]}`;
  } else {
    qtdDisponivel.innerHTML = "";
  }
}
