const entradaNome = document.getElementById('entradaNome');
const entradaQtd = document.getElementById('entradaQtd');
const entradaPessoa = document.getElementById('entradaPessoa');
const saidaNome = document.getElementById('saidaNome');
const saidaQtd = document.getElementById('saidaQtd');
const saidaPessoa = document.getElementById('saidaPessoa');
const retornoNome = document.getElementById('retornoNome');
const retornoQtd = document.getElementById('retornoQtd');
const retornoPessoa = document.getElementById('retornoPessoa');
const qtdDisponivel = document.getElementById('qtdDisponivel');
const pesquisa = document.getElementById('pesquisa');
const tabelaEstoque = document.getElementById('tabelaEstoque');
const tabelaHistorico = document.getElementById('tabelaHistorico');
const msgEntrada = document.getElementById('msgEntrada');
const msgSaida = document.getElementById('msgSaida');
const msgRetorno = document.getElementById('msgRetorno');

// Função segura para acessar localStorage
function getLocalStorage(key, defaultValue) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.warn(`Erro ao ler ${key} do localStorage:`, e);
    return defaultValue;
  }
}

function setLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Erro ao salvar ${key} no localStorage:`, e);
  }
}

let estoque = getLocalStorage('estoque', {
  "Caneta Azul": 50,
  "Lápis HB": 100,
  "Borracha Branca": 45
});

let historico = getLocalStorage('historico', []);

// Limpeza de dados antigos/corrompidos (sanitização)
historico = historico.map(mov => {
  if (mov.data && mov.data.includes('T') && mov.data.includes('Z')) {
    const d = new Date(mov.data);
    mov.data = d.toLocaleDateString('pt-BR');
    mov.hora = d.toLocaleTimeString('pt-BR');
  }
  return {
    tipo: mov.tipo || "Desconhecido",
    item: mov.item || "Produto não identificado",
    quantidade: mov.quantidade || 0,
    pessoa: mov.pessoa || "Não informado",
    data: mov.data || "Data indisponível",
    hora: mov.hora || ""
  };
}).filter(mov => {
  // Remove entradas completamente inválidas
  const isInvalid = mov.item === "Produto não identificado" && mov.pessoa === "Não informado";
  return !isInvalid;
});
setLocalStorage('historico', historico);

let paginaAtual = 1;
let paginaEstoqueAtual = 1;
const itensPorPagina = 5;

// Lógica de Abas
function openTab(evt, tabName) {
  const tabContents = document.getElementsByClassName("tab-content");
  for (let i = 0; i < tabContents.length; i++) {
    tabContents[i].classList.remove("active");
  }

  const tabBtns = document.getElementsByClassName("tab-btn");
  for (let i = 0; i < tabBtns.length; i++) {
    tabBtns[i].classList.remove("active");
  }

  document.getElementById(tabName).classList.add("active");
  evt.currentTarget.classList.add("active");

  // Atualiza visualização conforme a aba
  if (tabName === 'tab-estoque') {
    atualizarTabela();
  }
  if (tabName === 'tab-historico') {
    atualizarHistorico();
  }
}

function salvarDados() {
  setLocalStorage('estoque', estoque);
  setLocalStorage('historico', historico);
}

document.addEventListener('DOMContentLoaded', () => {
  atualizarTabela();
  atualizarSelects();
  atualizarHistorico();
});

function mostrarMensagem(elemento, texto, tipo) {
  elemento.textContent = texto;
  elemento.className = `msg-container msg-${tipo}`;
  elemento.style.display = 'block';
  setTimeout(() => {
    elemento.style.display = 'none';
    elemento.textContent = '';
  }, 3000);
}

// 1° ABA - ADICIONAR ITEM (ENTRADA)
function adicionarItem() {
  const nome = entradaNome.value.trim();
  const qtd = Number(entradaQtd.value);
  const pessoa = entradaPessoa.value.trim() || "Sistema";

  if (!nome || qtd <= 0) {
    return mostrarMensagem(msgEntrada, "Preencha nome e quantidade corretamente!", "error");
  }

  estoque[nome] = (estoque[nome] || 0) + qtd;

  const agora = new Date();
  historico.push({
    tipo: "Entrada",
    item: nome,
    quantidade: qtd,
    pessoa: pessoa,
    data: agora.toLocaleDateString('pt-BR'),
    hora: agora.toLocaleTimeString('pt-BR')
  });

  salvarDados();
  atualizarTabela();
  atualizarSelects();
  entradaNome.value = "";
  entradaQtd.value = "";
  entradaPessoa.value = "";
  mostrarMensagem(msgEntrada, "Entrada registrada com sucesso!", "success");
}

// 2° ABA - REMOVER ITEM (SAÍDA)
function removerItem() {
  const nome = saidaNome.value;
  const qtd = Number(saidaQtd.value);
  const pessoa = saidaPessoa.value.trim();

  if (!nome || qtd <= 0 || !pessoa) {
    return mostrarMensagem(msgSaida, "Preencha todos os campos!", "error");
  }

  if (!estoque[nome] || estoque[nome] < qtd) {
    return mostrarMensagem(msgSaida, "Quantidade insuficiente no estoque!", "error");
  }

  estoque[nome] -= qtd;
  // Não deletamos a chave para que o item continue aparecendo no "Retorno"

  const agora = new Date();
  historico.push({
    tipo: "Saída",
    item: nome,
    quantidade: qtd,
    pessoa: pessoa,
    data: agora.toLocaleDateString('pt-BR'),
    hora: agora.toLocaleTimeString('pt-BR')
  });

  salvarDados();
  mostrarMensagem(msgSaida, "Saída registrada!", "success");
  
  atualizarTabela();
  atualizarSelects();
  atualizarQtdDisponivelSaida();
  
  saidaNome.value = "";
  saidaQtd.value = "";
  saidaPessoa.value = "";
  qtdDisponivel.innerHTML = "";
}

// 3° ABA - RETORNAR ITEM (RETORNO)
function retornarItem() {
  const nome = retornoNome.value;
  const qtd = Number(retornoQtd.value);
  const pessoa = retornoPessoa.value.trim();

  if (!nome || qtd <= 0 || !pessoa) {
    return mostrarMensagem(msgRetorno, "Preencha todos os campos!", "error");
  }

  estoque[nome] = (estoque[nome] || 0) + qtd;

  const agora = new Date();
  historico.push({
    tipo: "Retorno",
    item: nome,
    quantidade: qtd,
    pessoa: pessoa,
    data: agora.toLocaleDateString('pt-BR'),
    hora: agora.toLocaleTimeString('pt-BR')
  });

  salvarDados();
  mostrarMensagem(msgRetorno, "Retorno registrado com sucesso!", "success");
  
  atualizarTabela();
  atualizarSelects();
  
  retornoNome.value = "";
  retornoQtd.value = "";
  retornoPessoa.value = "";
}

// 4° ABA - GESTÃO DE ESTOQUE
function atualizarTabela(filtro = "") {
  tabelaEstoque.innerHTML = "";
  const filtroLower = filtro.toLowerCase();
  
  const itensFiltrados = Object.keys(estoque).filter(item => 
    item.toLowerCase().includes(filtroLower)
  );

  const containerPaginacao = document.getElementById("paginacaoEstoque");
  if (itensFiltrados.length === 0) {
    tabelaEstoque.innerHTML = '<tr><td colspan="2" style="text-align:center; color:#999;">Nenhum item encontrado</td></tr>';
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

  document.getElementById("paginaIndicadorEstoque").innerText = `Página ${paginaEstoqueAtual} de ${totalPaginas}`;
  document.getElementById("btnAnteriorEstoque").disabled = (paginaEstoqueAtual === 1);
  document.getElementById("btnProximaEstoque").disabled = (paginaEstoqueAtual >= totalPaginas);
}

function filtrarEstoque() {
  paginaEstoqueAtual = 1; 
  atualizarTabela(pesquisa.value.trim());
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
    tabelaHistorico.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#999;">Sem histórico de movimentações</td></tr>';
    if (containerPaginacao) containerPaginacao.style.display = 'none';
    return;
  }

  if (containerPaginacao) containerPaginacao.style.display = 'flex';
  const totalPaginas = Math.ceil(historico.length / itensPorPagina);
  
  if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;
  if (paginaAtual < 1) paginaAtual = 1;

  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;

  // Criar cópia do histórico original com o índice real preservado para a exclusão
  const historicoComIndices = historico.map((item, index) => ({ ...item, realIndex: index }));
  const historicoOrdenado = [...historicoComIndices].reverse();
  const itensExibidos = historicoOrdenado.slice(inicio, fim);

  itensExibidos.forEach((mov) => {
    let corTipo = "color: #1a73e8;";
    const tipo = (mov.tipo || "Entrada").toLowerCase();
    
    if (tipo === "entrada") corTipo = "color: #188038;";
    else if (tipo === "saída" || tipo === "saida") corTipo = "color: #d93025;";
    else if (tipo === "retorno") corTipo = "color: #f29900;";

    // Capitaliza corretamente o tipo
    const tipoFormatado = mov.tipo.charAt(0).toUpperCase() + mov.tipo.slice(1).toLowerCase();

    tabelaHistorico.innerHTML += `
      <tr>
        <td style="${corTipo} font-weight: bold;">${tipoFormatado}</td>
        <td>${mov.item}</td>
        <td>${mov.quantidade}</td>
        <td>${mov.pessoa}</td>
        <td style="font-size: 11px;">${mov.data} ${mov.hora}</td>
      </tr>
    `;
  });

  document.getElementById('paginaIndicador').textContent = `Página ${paginaAtual} de ${totalPaginas}`;
  document.getElementById('btnAnterior').disabled = paginaAtual === 1;
  document.getElementById('btnProxima').disabled = (paginaAtual >= totalPaginas);
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

function atualizarSelects() {
  const itemSelSaida = saidaNome.value;
  const itemSelRetorno = retornoNome.value;
  
  const options = '<option value="">Selecione um item...</option>';
  saidaNome.innerHTML = options;
  retornoNome.innerHTML = options;
  
  const itens = Object.keys(estoque).sort();
  
  itens.forEach(item => {
    // Na saída, mostramos apenas se tiver quantidade
    if (estoque[item] > 0) {
      const optSaida = document.createElement("option");
      optSaida.value = item;
      optSaida.textContent = item;
      saidaNome.appendChild(optSaida);
    }

    // No retorno, mostramos todos que já existiram
    const optRetorno = document.createElement("option");
    optRetorno.value = item;
    optRetorno.textContent = item;
    retornoNome.appendChild(optRetorno);
  });
  
  if (estoque[itemSelSaida] && estoque[itemSelSaida] > 0) saidaNome.value = itemSelSaida;
  if (estoque[itemSelRetorno] !== undefined) retornoNome.value = itemSelRetorno;
}

function atualizarQtdDisponivelSaida() {
  const item = saidaNome.value;
  if (item && estoque[item]) {
    qtdDisponivel.innerHTML = `Disponível em estoque: ${estoque[item]}`;
  } else {
    qtdDisponivel.innerHTML = "";
  }
}

