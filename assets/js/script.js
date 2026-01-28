(function() {
    // Variáveis locais para elementos
    var form, produtoInput, quantidadeInput, tipoSelect, estoqueTbody, historicoTbody, totalProdutosEl, totalQtdEl;

    function selectElements() {
        form = document.getElementById('form');
        produtoInput = document.getElementById('produto');
        quantidadeInput = document.getElementById('quantidade');
        tipoSelect = document.getElementById('tipo');
        estoqueTbody = document.getElementById('estoque');
        historicoTbody = document.getElementById('historico');
        totalProdutosEl = document.getElementById('totalProdutos');
        totalQtdEl = document.getElementById('totalQtd');
        if (form) form.removeEventListener('submit', onFormSubmit);
        if (form) form.addEventListener('submit', onFormSubmit);
    }

    async function onFormSubmit(e) {
        e.preventDefault();
        const produto = produtoInput.value.trim();
        const quantidade = parseInt(quantidadeInput.value);
        const tipo = tipoSelect.value;
        if (!produto || !quantidade) return;
        await addMovement(produto, quantidade, tipo);
        if (form) form.reset();
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
                await loadStockMock();
            }
        } catch (error) {
            await loadStockMock();
        }
    }

    async function loadHistory() {
        try {
            const response = await fetch(`${window.API_BASE}/movements`).catch(() => ({ ok: false }));
            if (response.ok) {
                window.historico = await response.json();
            } else {
                await loadHistoryMock();
            }
        } catch (error) {
            await loadHistoryMock();
        }
    }

    async function addMovement(produto, quantidade, tipo) {
        try {
            const response = await fetch(`${window.API_BASE}/movements`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ produto, quantidade, tipo, data: new Date().toISOString() })
            }).catch(() => ({ ok: false }));

            if (response.ok) {
                await loadStock();
                await loadHistory();
                updateDisplay();
            } else {
                await addMovementMock(produto, quantidade, tipo);
                updateDisplay();
            }
        } catch (error) {
            await addMovementMock(produto, quantidade, tipo);
            updateDisplay();
        }
    }

    function updateDisplay() {
        if (!estoqueTbody && !historicoTbody) return;
        
        if (estoqueTbody) {
            estoqueTbody.innerHTML = '';
            let totalProdutos = 0;
            let totalQtd = 0;
            for (const [produto, qtd] of Object.entries(window.estoque || {})) {
                if (qtd > 0) {
                    totalProdutos++;
                    totalQtd += qtd;
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td>${produto}</td><td>${qtd}</td>`;
                    estoqueTbody.appendChild(tr);
                }
            }
            if (totalProdutosEl) totalProdutosEl.textContent = totalProdutos;
            if (totalQtdEl) totalQtdEl.textContent = totalQtd;
        }

        if (historicoTbody) {
            historicoTbody.innerHTML = '';
            (window.historico || []).slice(-10).reverse().forEach(item => {
                const tr = document.createElement('tr');
                const tipoLabel = (window.i18n && typeof i18n.t === 'function') ? i18n.t('tipo.' + item.tipo) : item.tipo;
                tr.innerHTML = `<td>${item.produto}</td><td>${item.quantidade}</td><td class="${item.tipo}">${tipoLabel}</td>`;
                historicoTbody.appendChild(tr);
            });
        }
    }

    async function init() {
        initMockData(); 
        selectElements();
        if (estoqueTbody || historicoTbody) {
            await loadStock();
            await loadHistory();
            updateDisplay();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.addEventListener('i18n:ready', () => {
        if (document.getElementById('estoque') || document.getElementById('historico')) {
            selectElements();
            updateDisplay();
        }
    });

    window.addEventListener('app:navigated', (e) => {
        const url = (e.detail && e.detail.url) || location.pathname;
        if (url.endsWith('/') || url.includes('index.html')) {
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
    window.estoque = {};
    data.forEach(item => { window.estoque[item.produto] = item.quantidade; });
}

async function loadHistoryMock() {
    window.historico = JSON.parse(localStorage.getItem('mockMovements') || '[]');
}

async function addMovementMock(produto, quantidade, tipo) {
    const newMovement = { produto, quantidade, tipo, data: new Date().toISOString() };
    if (!Array.isArray(window.historico)) window.historico = [];
    window.historico.push(newMovement);
    localStorage.setItem('mockMovements', JSON.stringify(window.historico));

    if (!window.estoque) window.estoque = {};
    const q = parseInt(quantidade) || 0;
    if (tipo === 'entrada') {
        window.estoque[produto] = (window.estoque[produto] || 0) + q;
    } else {
        window.estoque[produto] = Math.max(0, (window.estoque[produto] || 0) - q);
    }
    const stockArray = Object.entries(window.estoque).map(([p, q]) => ({ produto: p, quantidade: q }));
    localStorage.setItem('mockStock', JSON.stringify(stockArray));
}
