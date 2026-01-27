// API base URL
const API_BASE = localStorage.getItem('apiBase') || 'http://localhost:8080/api';

// Variáveis
let historico = [];

// Selecionar elementos
const filterForm = document.getElementById('filterForm');
const dataInicioInput = document.getElementById('dataInicio');
const dataFimInput = document.getElementById('dataFim');
const tipoFiltroSelect = document.getElementById('tipoFiltro');
const historicoTbody = document.getElementById('historico');

// Funções de API
async function loadHistory() {
    try {
        const response = await fetch(`${API_BASE}/movements`);
        if (response.ok) {
            historico = await response.json();
            // Assumindo resposta: [{produto: string, quantidade: number, tipo: string, data: string}]
        } else {
            console.error('Erro ao carregar histórico');
        }
    } catch (error) {
        console.error('Erro na requisição de histórico:', error);
    }
}

// Função para atualizar a exibição
function updateDisplay(filtered = historico) {
    historicoTbody.innerHTML = '';
    filtered.forEach(item => {
        const tr = document.createElement('tr');
        const locale = (window.i18n && typeof i18n.getLang === 'function') ? i18n.getLang() : 'pt-BR';
        const tipoLabel = (window.i18n && typeof i18n.t === 'function') ? i18n.t('tipo.' + item.tipo) : item.tipo;
        tr.innerHTML = `<td>${new Date(item.data).toLocaleDateString(locale)}</td><td>${item.produto}</td><td>${item.quantidade}</td><td class="${item.tipo}">${tipoLabel}</td>`;
        historicoTbody.appendChild(tr);
    });
}

// Evento de filtro
filterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const dataInicio = dataInicioInput.value ? new Date(dataInicioInput.value) : null;
    const dataFim = dataFimInput.value ? new Date(dataFimInput.value + 'T23:59:59') : null; // Fim do dia
    const tipo = tipoFiltroSelect.value;

    let filtered = historico.filter(item => {
        const itemDate = new Date(item.data);
        if (dataInicio && itemDate < dataInicio) return false;
        if (dataFim && itemDate > dataFim) return false;
        if (tipo && item.tipo !== tipo) return false;
        return true;
    });
    updateDisplay(filtered);
});

// Inicialização
async function init() {
    await loadHistory();
    updateDisplay();
}

init();

// Re-render if i18n becomes available later
window.addEventListener('i18n:ready', () => {
    updateDisplay();
});