const entradaNome = document.getElementById('entradaNome');
const entradaQtd = document.getElementById('entradaQtd');
const entradaPessoa = document.getElementById('entradaPessoa');
const entradaLocal = document.getElementById('entradaLocal');
const saidaNome = document.getElementById('saidaNome');
const saidaQtd = document.getElementById('saidaQtd');
const saidaPessoa = document.getElementById('saidaPessoa');
const saidaLocal = document.getElementById('saidaLocal');
const retornoNome = document.getElementById('retornoNome');
const retornoQtd = document.getElementById('retornoQtd');
const retornoPessoa = document.getElementById('retornoPessoa');
const retornoLocal = document.getElementById('retornoLocal');
const qtdDisponivel = document.getElementById('qtdDisponivel');
const pesquisa = document.getElementById('pesquisa');
const tabelaEstoque = document.getElementById('tabelaEstoque');
const tabelaHistorico = document.getElementById('tabelaHistorico');
const msgEntrada = document.getElementById('msgEntrada');
const msgSaida = document.getElementById('msgSaida');
const msgRetorno = document.getElementById('msgRetorno');
const msgHistorico = document.getElementById('msgHistorico');
const msgEstoque = document.getElementById('msgEstoque');

const HISTORICO_SENHA_HASH = 'd404559f602eab6fd602ac7680dacbfaadd13630335e951f097af3900e9de176';

function hashSenha(senha) {
  let hash = 0;
  for (let i = 0; i < senha.length; i++) {
    const char = senha.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; 
  }
  return Math.abs(hash).toString(16);
}

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
  "L�pis HB": 100,
  "Borracha Branca": 45
});

let historico = getLocalStorage('historico', []);


historico = historico.map(mov => {
  if (mov.data && mov.data.includes('T') && mov.data.includes('Z')) {
    const d = new Date(mov.data);
    mov.data = d.toLocaleDateString('pt-BR');
    mov.hora = d.toLocaleTimeString('pt-BR');
  }
  return {
    tipo: mov.tipo || "Desconhecido",
    item: mov.item || "Produto n�o identificado",
    quantidade: mov.quantidade || 0,
    pessoa: mov.pessoa || "N�o informado",
    local: mov.local || "",
    data: mov.data || "Data indispon�vel",
    hora: mov.hora || ""
  };
}).filter(mov => {
  const isInvalid = mov.item === "Produto n�o identificado" && mov.pessoa === "N�o informado";
  return !isInvalid;
});
setLocalStorage('historico', historico);

let paginaAtual = 1;
let paginaEstoqueAtual = 1;
const itensPorPagina = 5;

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

  if (tabName === 'tab-estoque') {
    atualizarTabela();
  }
  if (tabName === 'tab-historico') {
    atualizarHistorico();
  }
  
  if (tabName === 'tab-estoque') {
    pesquisa.value = '';
  }
}

let senhaCallback = null;

function abrirModalSenha(mensagem, callback) {
  senhaCallback = callback;
  document.getElementById('modalMsg').textContent = mensagem;
  document.getElementById('senhaInput').value = '';
  document.getElementById('modalSenha').classList.add('active');
  document.getElementById('senhaInput').focus();
}

function fecharModalSenha() {
  document.getElementById('modalSenha').classList.remove('active');
  document.getElementById('senhaInput').value = '';
  senhaCallback = null;
}

function confirmarSenha() {
  const senha = document.getElementById('senhaInput').value;
  const senhaValida = senha === 'admin';
  
  if (senhaValida) {
    if (senhaCallback) {
      senhaCallback(true);
    }
    fecharModalSenha();
  } else {
    const msg = document.getElementById('senhaInput');
    if (msg) {
      msg.style.border = '2px solid #ff8a80';
      msg.style.boxShadow = '0 0 0 3px rgba(255, 138, 128, 0.2)';
      setTimeout(() => {
        if (msg) {
          msg.style.border = '1px solid #2d5a8c';
          msg.style.boxShadow = 'none';
        }
      }, 1500);
      msg.value = '';
      msg.focus();
    }
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
  if (!elemento) return;
  elemento.textContent = texto;
  elemento.className = `msg-container msg-${tipo}`;
  elemento.style.display = 'block';
  setTimeout(() => {
    elemento.style.display = 'none';
    elemento.textContent = '';
  }, 3000);
}

function validarSenhaHistorico() {
  if (!msgHistorico) return null;
  return null;
}

function limparHistorico() {
  abrirModalSenha('Digite a senha para apagar o hist�rico:', (valido) => {
    if (valido) {
      historico = [];
      salvarDados();
      atualizarHistorico();
      mostrarMensagem(msgHistorico, 'Hist�rico apagado com sucesso.', 'success');
    }
  });
}

function limparEstoque() {
  abrirModalSenha('Digite a senha para apagar o estoque:', (valido) => {
    if (valido) {
      estoque = {};
      salvarDados();
      atualizarTabela();
      atualizarSelects();
      mostrarMensagem(msgEstoque, 'Estoque apagado com sucesso.', 'success');
    }
  });
}

function excluirHistorico(realIndex) {
  abrirModalSenha('Digite a senha para excluir este registro:', (valido) => {
    if (valido) {
      historico.splice(realIndex, 1);
      salvarDados();
      atualizarHistorico();
      mostrarMensagem(msgHistorico, 'Registro removido do hist�rico.', 'success');
    }
  });
}

function adicionarItem() {
  const nome = entradaNome.value.trim();
  const qtd = Number(entradaQtd.value);
  const pessoa = entradaPessoa.value.trim();
  const local = entradaLocal.value.trim();

  if (!nome || nome.length > 100 || qtd <= 0 || !Number.isInteger(qtd) || !pessoa || pessoa.length > 100 || !local || local.length > 100) {
    return mostrarMensagem(msgEntrada, "Preencha todos os campos com valores v�lidos (m�x 100 caracteres)!", "error");
  }

  estoque[nome] = (estoque[nome] || 0) + qtd;

  const agora = new Date();
  historico.push({
    tipo: "Entrada",
    item: nome,
    quantidade: qtd,
    pessoa: pessoa,
    local: local,
    data: agora.toLocaleDateString('pt-BR'),
    hora: agora.toLocaleTimeString('pt-BR')
  });

  salvarDados();
  atualizarTabela();
  atualizarSelects();
  entradaNome.value = "";
  entradaQtd.value = "";
  entradaPessoa.value = "";
  entradaLocal.value = "";
  mostrarMensagem(msgEntrada, "Entrada registrada com sucesso!", "success");
}

function removerItem() {
  const nome = saidaNome.value;
  const qtd = Number(saidaQtd.value);
  const pessoa = saidaPessoa.value.trim();
  const local = saidaLocal.value.trim();

  if (!nome || qtd <= 0 || !Number.isInteger(qtd) || !pessoa || pessoa.length > 100 || !local || local.length > 100) {
    return mostrarMensagem(msgSaida, "Preencha todos os campos com valores v�lidos (m�x 100 caracteres)!", "error");
  }

  if (!estoque[nome] || estoque[nome] < qtd) {
    return mostrarMensagem(msgSaida, "Quantidade insuficiente no estoque!", "error");
  }

  estoque[nome] -= qtd;

  const agora = new Date();
  historico.push({
    tipo: "Sa�da",
    item: nome,
    quantidade: qtd,
    pessoa: pessoa,
    local: local,
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
  saidaLocal.value = "";
  qtdDisponivel.innerHTML = "";
}

function retornarItem() {
  const nome = retornoNome.value;
  const qtd = Number(retornoQtd.value);
  const pessoa = retornoPessoa.value.trim();
  const local = retornoLocal.value.trim();

  if (!nome || qtd <= 0 || !Number.isInteger(qtd) || !pessoa || pessoa.length > 100 || !local || local.length > 100) {
    return mostrarMensagem(msgRetorno, "Preencha todos os campos com valores v�lidos (m�x 100 caracteres)!", "error");
  }

  estoque[nome] = (estoque[nome] || 0) + qtd;

  const agora = new Date();
  historico.push({
    tipo: "Retorno",
    item: nome,
    quantidade: qtd,
    pessoa: pessoa,
    local: local,
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
  retornoLocal.value = "";
}

function atualizarTabela(filtro = "") {
  tabelaEstoque.innerHTML = "";
  const filtroLower = filtro.toLowerCase();
  
  const itensFiltrados = Object.keys(estoque).filter(item => 
    item.toLowerCase().includes(filtroLower)
  );

  const containerPaginacao = document.getElementById("paginacaoEstoque");
  if (itensFiltrados.length === 0) {
    tabelaEstoque.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#999;">Nenhum item encontrado</td></tr>';
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
    const itemEscapado = item.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const itemHtml = item.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    tabelaEstoque.innerHTML += `
      <tr>
        <td>${itemHtml}</td>
        <td style="text-align: center;">${estoque[item]}</td>
        <td style="text-align: center;">
          <button class="btn-estoque-deletar" onclick="deletarItemEstoque('${itemEscapado}')">Deletar</button>
        </td>
      </tr>
    `;
  });

  document.getElementById("paginaIndicadorEstoque").innerText = `P�gina ${paginaEstoqueAtual} de ${totalPaginas}`;
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
    tabelaHistorico.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#999;">Sem histórico de movimentações</td></tr>';
    if (containerPaginacao) containerPaginacao.style.display = 'none';
    return;
  }

  if (containerPaginacao) containerPaginacao.style.display = 'flex';
  const totalPaginas = Math.ceil(historico.length / itensPorPagina);
  
  if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;
  if (paginaAtual < 1) paginaAtual = 1;

  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;

  const historicoComIndices = historico.map((item, index) => ({ ...item, realIndex: index }));
  const historicoOrdenado = [...historicoComIndices].reverse();
  
  historicoOrdenado.forEach((item, i) => {
    item.realIndex = historico.length - 1 - i;
  });
  
  const itensExibidos = historicoOrdenado.slice(inicio, fim);

  itensExibidos.forEach((mov) => {
    const tipo = (mov.tipo || "Entrada").toLowerCase();
    let classeTipo = "historico-type-entrada";
    
    if (tipo === "entrada") classeTipo = "historico-type-entrada";
    else if (tipo === "sa�da" || tipo === "saida") classeTipo = "historico-type-saida";
    else if (tipo === "retorno") classeTipo = "historico-type-retorno";

    const tipoFormatado = mov.tipo.charAt(0).toUpperCase() + mov.tipo.slice(1).toLowerCase();
    const localExibicao = (mov.local || '-').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const itemHtml = (mov.item || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const pessoaHtml = (mov.pessoa || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    tabelaHistorico.innerHTML += `
      <tr>
        <td class="${classeTipo}">${tipoFormatado}</td>
        <td>${itemHtml}</td>
        <td style="text-align: center;">${mov.quantidade}</td>
        <td class="historico-responsavel">${pessoaHtml}</td>
        <td style="font-size: 13px; color: #90caf9;">${localExibicao}</td>
        <td>
          <div class="historico-date">
            <span>${mov.data} ${mov.hora}</span>
            <button type="button" class="btn-historico-excluir" onclick="excluirHistorico(${mov.realIndex})">Excluir</button>
          </div>
        </td>
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
    
    if (estoque[item] > 0) {
      const optSaida = document.createElement("option");
      optSaida.value = item;
      optSaida.textContent = item;
      saidaNome.appendChild(optSaida);
    }

    
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

let itemParaDeletar = null;

function deletarItemEstoque(nomeItem) {
  abrirModalSenha('Digite a senha para deletar este item:', (valido) => {
    if (valido) {
      delete estoque[nomeItem];
      salvarDados();
      atualizarTabela();
      atualizarSelects();
      
      mostrarMensagem(msgEstoque, `"${nomeItem}" foi deletado do estoque`, 'success');
    }
  });
}

document.addEventListener('click', (e) => {
  const modalSenha = document.getElementById('modalSenha');
  if (!modalSenha) return;
  const modalContent = modalSenha.querySelector('.modal-content');
  if (e.target === modalSenha && modalContent && !modalContent.contains(e.target)) {
    fecharModalSenha();
  }
}, true);


