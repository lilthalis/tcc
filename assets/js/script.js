/**
 * ERP Stock Control - Main Script
 * Optimized for performance and clean UI bridge
 */
(function () {
    // 1. Configurações e Estado
    const state = {
        get apiBase() { return localStorage.getItem('apiBase') || ''; },
        estoque: {},
        historico: [],
        sort: { column: 'produto', direction: 'asc' },
        pagination: { page: 1, limit: 10 }
    };

    // Expor funções globais para o HTML
    window.toggleSort = function(column) {
        if (state.sort.column === column) {
            state.sort.direction = state.sort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            state.sort.column = column;
            state.sort.direction = 'asc';
        }
        render();
    };

    window.mudarPagina = function(delta) {
        const totalPages = Math.ceil(state.historico.length / state.pagination.limit);
        const newPage = state.pagination.page + delta;
        if (newPage >= 1 && newPage <= totalPages) {
            state.pagination.page = newPage;
            render();
        }
    };

    window.exportarCSV = function() {
        let csv = "Produto,Quantidade,Tipo,Data\n";
        state.historico.forEach(item => {
            csv += `${item.produto},${item.quantidade},${item.tipo},${new Date(item.data).toLocaleString()}\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', `relatorio_estoque_${new Date().toISOString().split('T')[0]}.csv`);
        a.click();
    };

    function selectElements() {
        el = {
            form: document.getElementById('form'),
            produto: document.getElementById('produto'),
            quantidade: document.getElementById('quantidade'),
            tipo: document.getElementById('tipo'),
            estoqueTbody: document.getElementById('estoque'),
            historicoTbody: document.getElementById('historico'),
            totalProdutos: document.getElementById('totalProdutos'),
            totalQtd: document.getElementById('totalQtd')
        };

        if (el.form) {
            el.form.removeEventListener('submit', handleFormSubmit);
            el.form.addEventListener('submit', handleFormSubmit);
        }
    }

    // 2. Helpers de Normalização
    const normalize = {
        tipo: (t) => {
            if (!t) return '';
            const v = t.toString().toLowerCase();
            if (['entrada', 'entry', 'p_entrada'].includes(v)) return 'entrada';
            if (['saida', 'saída', 'exit', 'p_saida'].includes(v)) return 'saida';
            return v;
        },
        data: (d) => {
            const dt = d ? new Date(d) : new Date();
            return isNaN(dt.getTime()) ? new Date().toISOString() : dt.toISOString();
        }
    };

    // 3. Lógica de Dados (API / MOCK)
    async function fetchData(endpoint) {
        if (state.apiBase) {
            try {
                const response = await fetch(`${state.apiBase}/${endpoint}`);
                if (response.ok) return await response.json();
            } catch (e) { console.error(`Erro API ${endpoint}:`, e); }
        }
        // Fallback para Mocks
        if (endpoint === 'stock') return await loadStockMock();
        if (endpoint === 'movements') return await loadHistoryMock();
        return null;
    }

    async function syncData() {
        const stockData = await fetchData('stock');
        const historyData = await fetchData('movements');

        // Atualiza estado global/window para compatibilidade
        window.estoque = {};
        if (Array.isArray(stockData)) {
            stockData.forEach(item => window.estoque[item.produto] = item.quantidade);
        } else {
            window.estoque = stockData || {};
        }
        
        window.historico = (Array.isArray(historyData) ? historyData : []).map(m => ({
            ...m,
            tipo: normalize.tipo(m.tipo),
            data: normalize.data(m.data || m.date)
        }));

        render();
    }

    // 4. Manipulação de Eventos
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        const movimento = {
            produto: el.produto.value.trim(),
            quantidade: parseInt(el.quantidade.value),
            tipo: normalize.tipo(el.tipo.value)
        };

        // Validações
        if (!movimento.produto || isNaN(movimento.quantidade) || movimento.quantidade <= 0) {
            alert('Dados inválidos. Verifique produto e quantidade.');
            return;
        }

        if (movimento.tipo === 'saida') {
            const disponivel = window.estoque[movimento.produto] || 0;
            if (disponivel < movimento.quantidade) {
                alert(`Estoque insuficiente! Disponível: ${disponivel}`);
                return;
            }
        }

        const btn = el.form.querySelector('button[type="submit"]');
        try {
            if (btn) btn.disabled = true;

            if (state.apiBase) {
                await fetch(`${state.apiBase}/movements`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...movimento, data: new Date().toISOString() })
                });
            } else {
                await addMovementMock(movimento.produto, movimento.quantidade, movimento.tipo);
            }

            el.form.reset();
            await syncData();
        } catch (err) {
            alert('Erro ao registrar no banco de dados.');
        } finally {
            if (btn) btn.disabled = false;
        }
    }

    // 5. Renderização da UI
    function render() {
        // 1. Dashboard Stats
        const items = Object.entries(window.estoque).map(([prod, qtd]) => ({ prod, qtd }));
        const critico = items.filter(i => i.qtd <= 5).length;
        const hoje = new Date().toISOString().split('T')[0];
        const movsHoje = window.historico.filter(h => h.data.startsWith(hoje)).length;

        if (document.getElementById('totalProdutos')) document.getElementById('totalProdutos').textContent = items.length;
        if (document.getElementById('totalQtd')) document.getElementById('totalQtd').textContent = items.reduce((acc, i) => acc + i.qtd, 0);
        if (document.getElementById('estoqueCritico')) document.getElementById('estoqueCritico').textContent = critico;
        if (document.getElementById('movimentacoesHoje')) document.getElementById('movimentacoesHoje').textContent = movsHoje;

        // 2. Render Estoque
        if (el.estoqueTbody) {
            let html = '';
            const filteredItems = items.filter(item => item.qtd > 0);

            // Ordenação
            filteredItems.sort((a, b) => {
                let valA = state.sort.column === 'produto' ? a.prod.toLowerCase() : a.qtd;
                let valB = state.sort.column === 'produto' ? b.prod.toLowerCase() : b.qtd;
                if (valA < valB) return state.sort.direction === 'asc' ? -1 : 1;
                if (valA > valB) return state.sort.direction === 'asc' ? 1 : -1;
                return 0;
            });

            filteredItems.forEach(({ prod, qtd }) => {
                const isCritico = qtd <= 5;
                html += `<tr class="${isCritico ? 'row-alert' : ''}">
                    <td class="text-start">${prod} ${isCritico ? '⚠️' : ''}</td>
                    <td class="text-center"><strong>${qtd}</strong></td>
                </tr>`;
            });
            el.estoqueTbody.innerHTML = html || '<tr><td colspan="2" class="text-center">Estoque vazio</td></tr>';
        }

        // 3. Render Histórico com Paginação
        if (el.historicoTbody) {
            const hist = [...window.historico].sort((a, b) => new Date(b.data) - new Date(a.data));
            const totalPages = Math.ceil(hist.length / state.pagination.limit) || 1;
            
            if (state.pagination.page > totalPages) state.pagination.page = totalPages;

            const start = (state.pagination.page - 1) * state.pagination.limit;
            const end = start + state.pagination.limit;
            const paginated = hist.slice(start, end);

            el.historicoTbody.innerHTML = paginated.map(item => `
                <tr class="${item.tipo}">
                    <td class="text-start">${item.produto}</td>
                    <td class="text-center">${item.quantidade}</td>
                    <td class="text-center"><span class="badge">${item.tipo.toUpperCase()}</span></td>
                    <td class="text-end text-muted">${new Date(item.data).toLocaleString('pt-BR')}</td>
                </tr>
            `).join('');

            // UI Paginação
            const pageInfo = document.getElementById('pageInfo');
            if (pageInfo) pageInfo.textContent = `Página ${state.pagination.page} de ${totalPages}`;
            
            const btnPrev = document.getElementById('btnPrev');
            const btnNext = document.getElementById('btnNext');
            if (btnPrev) btnPrev.disabled = state.pagination.page === 1;
            if (btnNext) btnNext.disabled = state.pagination.page === totalPages;
        }
    }

    // 6. Inicialização
    function init() {
        if (typeof initMockData === 'function') initMockData();
        selectElements();
        
        // Aplica tema
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        
        syncData();
    }

    // Event Listeners de Ciclo de Vida
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Listener para navegação via SPA (se aplicável)
    window.addEventListener('app:navigated', init);

})();

/**
 * Funções Globais e Utilitárias
 */

function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const btn = document.querySelector('.theme-toggle');
    if (btn) btn.textContent = newTheme === 'dark' ? '☀️' : '🌙';
}

// Bridges para Mocks (Mantidos conforme sua estrutura)
function initMockData(){ if (window.mockAPI?.initMockData) window.mockAPI.initMockData(); }
async function loadStockMock(){ return window.mockAPI?.loadStockMock ? await window.mockAPI.loadStockMock() : {}; }
async function loadHistoryMock(){ return window.mockAPI?.loadHistoryMock ? await window.mockAPI.loadHistoryMock() : []; }
async function addMovementMock(p, q, t){ return window.mockAPI?.addMovementMock ? await window.mockAPI.addMovementMock(p, q, t) : null; }