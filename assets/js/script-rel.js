(function() {
    let estoqueChart, movChart;
    let estoqueChartCanvas, movChartCanvas;

    function selectElements() {
        estoqueChartCanvas = document.getElementById('estoqueChart');
        movChartCanvas = document.getElementById('movChart');
    }

    async function loadStock() {
        try {
            const response = await fetch(`${window.API_BASE}/stock`).catch(() => ({ ok: false }));
            if (response.ok) {
                const data = await response.json();
                window.estoque = {};
                data.forEach(item => {
                    window.estoque[item.produto] = item.quantidade;
                });
            } else {
                window.estoque = await loadStockMock();
            }
        } catch (error) {
            window.estoque = await loadStockMock();
        }
    }

    async function loadHistory() {
        try {
            const response = await fetch(`${window.API_BASE}/movements`).catch(() => ({ ok: false }));
            if (response.ok) {
                window.historico = await response.json();
            } else {
                window.historico = await loadHistoryMock();
            }
        } catch (error) {
            window.historico = await loadHistoryMock();
        }
    }

    function createCharts() {
        if (typeof Chart === 'undefined') {
            console.error('Chart.js não carregado');
            return;
        }
        
        selectElements();
        if (!estoqueChartCanvas || !movChartCanvas) return;

        // Destruir gráficos existentes para evitar bugs de re-renderização na SPA
        if (estoqueChart) estoqueChart.destroy();
        if (movChart) movChart.destroy();

        const labelsEstoque = Object.keys(window.estoque || {});
        const dataEstoque = Object.values(window.estoque || {});

        estoqueChart = new Chart(estoqueChartCanvas, {
            type: 'bar',
            data: {
                labels: labelsEstoque,
                datasets: [{
                    label: (window.i18n && typeof i18n.t === 'function') ? i18n.t('charts.stock') : 'Estoque Atual',
                    data: dataEstoque,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true } }
            }
        });

        const movements = window.historico || [];
        const entries = movements.filter(m => m.tipo === 'entrada').length;
        const exits = movements.filter(m => m.tipo === 'saida').length;

        movChart = new Chart(movChartCanvas, {
            type: 'pie',
            data: {
                labels: [
                    (window.i18n && typeof i18n.t === 'function') ? i18n.t('tipo.entrada') : 'Entrada',
                    (window.i18n && typeof i18n.t === 'function') ? i18n.t('tipo.saida') : 'Saída'
                ],
                datasets: [{
                    data: [entries, exits],
                    backgroundColor: ['rgba(75, 192, 192, 0.5)', 'rgba(255, 99, 132, 0.5)'],
                    borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
                    borderWidth: 1
                }]
            },
            options: { responsive: true }
        });
    }

    async function init() {
        initMockData(); 
        selectElements();
        if (estoqueChartCanvas || movChartCanvas) {
            await loadStock();
            await loadHistory();
            createCharts();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.addEventListener('i18n:ready', () => {
        if (document.getElementById('estoqueChart') || document.getElementById('movChart')) {
            createCharts();
        }
    });

    window.addEventListener('app:navigated', (e) => {
        const url = (e.detail && e.detail.url) || location.pathname;
        if (url.includes('relatorios.html')) {
            init();
        }
    });
})();

// Globais
window.API_BASE = window.API_BASE || localStorage.getItem('apiBase') || 'http://localhost:8080/api';
if (typeof window.estoque === 'undefined') window.estoque = {};
if (typeof window.historico === 'undefined') window.historico = [];

function initMockData() {
    if (!localStorage.getItem('mockInitialized')) {
        const mockStock = [
            { produto: 'Teclado Mecânico', quantidade: 15 },
            { produto: 'Mouse Óptico', quantidade: 8 },
            { produto: 'Monitor 24"', quantidade: 5 },
            { produto: 'Cabo HDMI', quantidade: 20 },
            { produto: 'Fonte ATX 500W', quantidade: 3 }
        ];
        localStorage.setItem('mockStock', JSON.stringify(mockStock));

        const mockMovements = [
            { produto: 'Teclado Mecânico', quantidade: 10, tipo: 'entrada', data: '2024-01-15T10:00:00Z' },
            { produto: 'Mouse Óptico', quantidade: 5, tipo: 'entrada', data: '2024-01-16T11:00:00Z' },
            { produto: 'Monitor 24"', quantidade: 2, tipo: 'saida', data: '2024-01-17T12:00:00Z' },
            { produto: 'Cabo HDMI', quantidade: 15, tipo: 'entrada', data: '2024-01-18T13:00:00Z' },
            { produto: 'Fonte ATX 500W', quantidade: 1, tipo: 'saida', data: '2024-01-19T14:00:00Z' }
        ];
        localStorage.setItem('mockMovements', JSON.stringify(mockMovements));
        localStorage.setItem('mockInitialized', 'true');
    }
}

async function loadStockMock() {
    const data = JSON.parse(localStorage.getItem('mockStock') || '[]');
    const mockEstoque = {};
    data.forEach(item => { mockEstoque[item.produto] = item.quantidade; });
    return mockEstoque;
}

async function loadHistoryMock() {
    return JSON.parse(localStorage.getItem('mockMovements') || '[]');
}
