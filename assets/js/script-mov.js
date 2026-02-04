/**
 * Mock API for Stock Control
 * Uses localStorage for persistence
 */

window.mockAPI = {
    initMockData() {
        const currentEstoque = JSON.parse(localStorage.getItem('estoque') || '{}');
        const currentHistorico = JSON.parse(localStorage.getItem('historico') || '[]');
        
        if (Object.keys(currentEstoque).length < 5 || currentHistorico.length === 0) {
            console.log("Reinicializando estoque e histórico com 10 produtos e algumas saídas...");
            
            const initialStock = {
                'Notebook Gamer': 10,
                'Mouse Sem Fio': 25,
                'Monitor UltraWide': 5,
                'Teclado Mecânico': 12,
                'Headset 7.1': 15,
                'Cadeira Office': 8,
                'Webcam 4K': 7,
                'Impressora Laser': 4,
                'SSD 1TB': 30,
                'Memória RAM 16GB': 20
            };

            const entries = Object.entries(initialStock).map(([produto, qtd], index) => ({
                produto,
                quantidade: qtd,
                tipo: 'entrada',
                data: new Date(Date.now() - (index * 3600000 + 1800000)).toISOString() // Mais antigo
            }));

            // Adicionando algumas saídas mockadas
            const exits = [
                { produto: 'Mouse Sem Fio', quantidade: 2, tipo: 'saida', data: new Date(Date.now() - 300000).toISOString() },
                { produto: 'Notebook Gamer', quantidade: 1, tipo: 'saida', data: new Date(Date.now() - 600000).toISOString() },
                { produto: 'SSD 1TB', quantidade: 5, tipo: 'saida', data: new Date(Date.now() - 900000).toISOString() }
            ];

            // Atualiza o estoque subtraindo as saídas
            exits.forEach(exit => {
                if (initialStock[exit.produto]) {
                    initialStock[exit.produto] -= exit.quantidade;
                }
            });

            const initialHistory = [...exits, ...entries]; // Saídas no topo por serem mais recentes

            localStorage.setItem('estoque', JSON.stringify(initialStock));
            localStorage.setItem('historico', JSON.stringify(initialHistory));
        }
    },

    async loadStockMock() {
        const data = localStorage.getItem('estoque');
        return data ? JSON.parse(data) : {};
    },

    async loadHistoryMock() {
        const data = localStorage.getItem('historico');
        return data ? JSON.parse(data) : [];
    },

    async addMovementMock(produto, quantidade, tipo) {
        const estoque = await this.loadStockMock();
        const historico = await this.loadHistoryMock();
        const qtd = parseInt(quantidade);

        if (tipo === 'entrada' || tipo === 'entry') {
            estoque[produto] = (estoque[produto] || 0) + qtd;
        } else if (tipo === 'saida' || tipo === 'exit') {
            const atual = estoque[produto] || 0;
            if (atual < qtd) {
                alert('Estoque insuficiente para esta saída!');
                throw new Error('Estoque insuficiente');
            }
            estoque[produto] = atual - qtd;
        }

        // Remove do estoque se chegar a zero
        if (estoque[produto] <= 0) {
            delete estoque[produto];
        }

        historico.push({
            produto,
            quantidade: qtd,
            tipo: (tipo === 'entry' || tipo === 'entrada') ? 'entrada' : 'saida',
            data: new Date().toISOString()
        });

        localStorage.setItem('estoque', JSON.stringify(estoque));
        localStorage.setItem('historico', JSON.stringify(historico));
        return true;
    }
};