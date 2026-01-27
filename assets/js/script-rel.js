// API base URL
const API_BASE = localStorage.getItem('apiBase') || 'http://localhost:8080/api';

// Variáveis
let estoque = {};
let historico = [];

// Selecionar elementos
const estoqueChartCanvas = document.getElementById('estoqueChart');
const movChartCanvas = document.getElementById('movChart');

// Funções de API
async function loadStock() {
    try {
        const response = await fetch(`${API_BASE}/stock`);
        if (response.ok) {
            const data = await response.json();
            estoque = {};
            data.forEach(item => {
                estoque[item.produto] = item.quantidade;
            });
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
        }
    } catch (error) {
        console.error('Erro na requisição de histórico:', error);
    }
}

// Criar gráficos
function createCharts() {
    // Gráfico de estoque
    const produtos = Object.keys(estoque);
    const quantidades = Object.values(estoque);
    new Chart(estoqueChartCanvas, {
        type: 'bar',
        data: {
            labels: produtos,
            datasets: [{
                label: (window.i18n && typeof i18n.t === 'function') ? i18n.t('table.quantity') : 'Quantidade',
                data: quantidades,
                backgroundColor: 'rgba(99, 102, 241, 0.6)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Gráfico de movimentações por tipo
    const entradaCount = historico.filter(item => item.tipo === 'entrada').length;
    const saidaCount = historico.filter(item => item.tipo === 'saida').length;
    new Chart(movChartCanvas, {
        type: 'pie',
        data: {
            labels: [(window.i18n && typeof i18n.t === 'function') ? i18n.t('tipo.entrada') : 'Entrada', (window.i18n && typeof i18n.t === 'function') ? i18n.t('tipo.saida') : 'Saída'],
            datasets: [{
                data: [entradaCount, saidaCount],
                backgroundColor: ['rgba(34, 197, 94, 0.6)', 'rgba(239, 68, 68, 0.6)'],
                borderColor: ['rgba(34, 197, 94, 1)', 'rgba(239, 68, 68, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true
        }
    });
}

// Inicialização
async function init() {
    await loadStock();
    await loadHistory();
    createCharts();
}

init();

// Recreate charts when i18n becomes available later (for translated labels)
window.addEventListener('i18n:ready', () => {
    createCharts();
});