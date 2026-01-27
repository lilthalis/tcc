// API base URL (carregado das configurações)
const API_BASE = localStorage.getItem('apiBase') || 'http://localhost:8080/api';

// Variáveis globais
let estoque = {};
let historico = [];

// Selecionar elementos
const form = document.getElementById('form');
const produtoInput = document.getElementById('produto');
const quantidadeInput = document.getElementById('quantidade');
const tipoSelect = document.getElementById('tipo');
const estoqueTbody = document.getElementById('estoque');
const historicoTbody = document.getElementById('historico');
const totalProdutosEl = document.getElementById('totalProdutos');
const totalQtdEl = document.getElementById('totalQtd');

// Funções de API
async function loadStock() {
    try {
        const response = await fetch(`${API_BASE}/stock`);
        if (response.ok) {
            const data = await response.json();
            // Assumindo resposta: [{produto: string, quantidade: number}]
            estoque = {};
            data.forEach(item => {
                estoque[item.produto] = item.quantidade;
            });
        } else {
            console.error('Erro ao carregar estoque');
        }
    } catch (error) {
        console.error('Erro na requisição de estoque:', error);
    }
}

async function loadHistory() {
    try {
        const response = await fetch(`${API_BASE}/movements`);
        if (response.ok) {
            historico = await response.json();
            // Assumindo resposta: [{produto: string, quantidade: number, tipo: string}]
        } else {
            console.error('Erro ao carregar histórico');
        }
    } catch (error) {
        console.error('Erro na requisição de histórico:', error);
    }
}

async function addMovement(produto, quantidade, tipo) {
    try {
        const response = await fetch(`${API_BASE}/movements`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ produto, quantidade, tipo, data: new Date().toISOString() })
        });
        if (response.ok) {
            // Recarregar dados após sucesso
            await loadStock();
            await loadHistory();
            updateDisplay();
        } else {
            alert('Erro ao registrar movimentação');
        }
    } catch (error) {
        console.error('Erro na requisição de movimentação:', error);
    }
}

// Função para atualizar a exibição
function updateDisplay() {
    // Atualizar tabela de estoque
    estoqueTbody.innerHTML = '';
    let totalProdutos = 0;
    let totalQtd = 0;
    for (const [produto, qtd] of Object.entries(estoque)) {
        if (qtd > 0) {
            totalProdutos++;
            totalQtd += qtd;
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${produto}</td><td>${qtd}</td>`;
            estoqueTbody.appendChild(tr);
        }
    }
    totalProdutosEl.textContent = totalProdutos;
    totalQtdEl.textContent = totalQtd;

    // Atualizar tabela de histórico
    historicoTbody.innerHTML = '';
    historico.forEach(item => {
        const tr = document.createElement('tr');
        const tipoLabel = (window.i18n && typeof i18n.t === 'function') ? i18n.t('tipo.' + item.tipo) : item.tipo;
        tr.innerHTML = `<td>${item.produto}</td><td>${item.quantidade}</td><td class="${item.tipo}">${tipoLabel}</td>`;
        historicoTbody.appendChild(tr);
    });
}

// Evento de submissão do formulário
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const produto = produtoInput.value.trim();
    const quantidade = parseInt(quantidadeInput.value);
    const tipo = tipoSelect.value;

    if (!produto || !quantidade) return;

    await addMovement(produto, quantidade, tipo);
    form.reset();
});

// Inicialização
async function init() {
    await loadStock();
    await loadHistory();
    updateDisplay();
}

init();

// Re-render if i18n becomes available later
window.addEventListener('i18n:ready', () => {
    updateDisplay();
});