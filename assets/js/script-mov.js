(function() {
    // Variáveis locais para elementos (dentro do escopo deste script)
    var filterForm, dataInicioInput, dataFimInput, tipoFiltroSelect, historicoTbody;

    function selectElements() {
        filterForm = document.getElementById('filterForm');
        dataInicioInput = document.getElementById('dataInicio');
        dataFimInput = document.getElementById('dataFim');
        tipoFiltroSelect = document.getElementById('tipoFiltro');
        historicoTbody = document.getElementById('historico');
        
        if (filterForm) {
            filterForm.removeEventListener('submit', onFilterSubmit);
            filterForm.addEventListener('submit', onFilterSubmit);
        }
    }

    function onFilterSubmit(e) {
        e.preventDefault();
        if (!dataInicioInput || !dataFimInput || !tipoFiltroSelect) return;

        const dInicio = dataInicioInput.value; 
        const dFim = dataFimInput.value;
        const dataInicioVal = dInicio ? new Date(dInicio + 'T00:00:00') : null;
        const dataFimVal = dFim ? new Date(dFim + 'T23:59:59') : null;
        const tipo = tipoFiltroSelect.value;

        let filtered = (window.historico || []).filter(item => {
            const itemDate = new Date(item.data);
            if (dataInicioVal && itemDate < dataInicioVal) return false;
            if (dataFimVal && itemDate > dataFimVal) return false;
            if (tipo && item.tipo !== tipo) return false;
            return true;
        });
        updateDisplay(filtered);
    }

    async function loadHistory() {
        try {
            // Silencia erro de conexão se API não estiver rodando
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

    function updateDisplay(filtered = window.historico) {
        if (!historicoTbody) return;
        historicoTbody.innerHTML = '';
        const displayList = Array.isArray(filtered) ? filtered : [];
        displayList.forEach(item => {
            const tr = document.createElement('tr');
            const locale = (window.i18n && typeof window.i18n.getLang === 'function') ? window.i18n.getLang() : 'pt-BR';
            const tipoLabel = (window.i18n && typeof window.i18n.t === 'function') ? window.i18n.t('tipo.' + item.tipo) : item.tipo;
            const dateObj = new Date(item.data);
            const dateStr = isNaN(dateObj.getTime()) ? item.data : dateObj.toLocaleDateString(locale);
            tr.innerHTML = `<td>${dateStr}</td><td>${item.produto}</td><td>${item.quantidade}</td><td class="${item.tipo}">${tipoLabel}</td>`;
            historicoTbody.appendChild(tr);
        });
    }

    async function init() {
        selectElements();
        if (historicoTbody) {
            await loadHistory();
            updateDisplay();
        }
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }

    window.addEventListener('i18n:ready', () => {
        if (document.getElementById('historico')) {
            selectElements();
            updateDisplay();
        }
    });

    window.addEventListener('app:navigated', (e) => {
        const url = (e.detail && e.detail.url) || location.pathname;
        if (url.includes('movimentacoes.html') || url.includes('movimentacoes')) {
            init();
        }
    });
})();

// Globais compartilhadas e Mock
window.API_BASE = window.API_BASE || localStorage.getItem('apiBase') || 'http://localhost:8080/api';
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

async function loadHistoryMock() {
    initMockData();
    return JSON.parse(localStorage.getItem('mockMovements') || '[]');
}
