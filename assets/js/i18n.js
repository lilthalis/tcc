// Auxiliar i18n simples
(function(){
    const translations = {
        'pt-BR': {
            'logo': '📦 StockFlow',
            'menu.dashboard': 'Dashboard',
            'menu.mov': 'Movimentações',
            'menu.reports': 'Relatórios',

            'page.dashboard.title': 'Dashboard',
            'page.dashboard.subtitle': 'Gestão profissional de estoque',
            'card.products': 'Produtos Cadastrados',
            'card.total': 'Total em Estoque',

            'form.product': 'Produto',
            'form.product.placeholder': 'Ex: Teclado Mecânico',
            'form.quantity': 'Quantidade',
            'form.type': 'Tipo',
            'form.submit': 'Registrar Movimentação',

            'table.product': 'Produto',
            'table.quantity': 'Quantidade',
            'table.type': 'Tipo',
            'table.qtd': 'Qtd',
            'table.date': 'Data',

            'filter.start': 'Data Início',
            'filter.end': 'Data Fim',
            'filter.apply': 'Aplicar Filtros',
            'filter.title': 'Filtros',
            'filter.all': 'Todos',

            'tipo.entrada': 'Entrada',
            'tipo.saida': 'Saída',

            'movements.title': 'Movimentações',
            'movements.subtitle': 'Histórico de entradas e saídas',
            'movements.history': 'Histórico de Movimentações',

            'dashboard.stock': 'Estoque Atual',
            'dashboard.history': 'Histórico',

            'reports.title': 'Relatórios',
            'reports.subtitle': 'Análises e gráficos do estoque',
            'reports.stock': 'Estoque Atual',
            'reports.movByType': 'Movimentações por Tipo',

            'menu.settings': 'Configurações',
            'settings.title': 'Configurações',
            'settings.subtitle': 'Ajustes do sistema',
            'settings.general': 'Configurações Gerais',
            'settings.language': 'Idioma',
            'settings.save': 'Salvar',
            'settings.saved': 'Configurações salvas!'
        },
        'en': {
            'logo': '📦 StockFlow',
            'menu.dashboard': 'Dashboard',
            'menu.mov': 'Movements',
            'menu.reports': 'Reports',

            'page.dashboard.title': 'Dashboard',
            'page.dashboard.subtitle': 'Professional stock management',
            'card.products': 'Registered Products',
            'card.total': 'Total In Stock',

            'form.product': 'Product',
            'form.product.placeholder': 'E.g.: Mechanical Keyboard',
            'form.quantity': 'Quantity',
            'form.type': 'Type',
            'form.submit': 'Register Movement',

            'table.product': 'Product',
            'table.quantity': 'Quantity',
            'table.type': 'Type',
            'table.qtd': 'Qty',
            'table.date': 'Date',

            'filter.start': 'Start Date',
            'filter.end': 'End Date',
            'filter.apply': 'Apply Filters',
            'filter.title': 'Filters',
            'filter.all': 'All',

            'tipo.entrada': 'Entry',
            'tipo.saida': 'Exit',

            'movements.title': 'Movements',
            'movements.subtitle': 'History of entries and exits',
            'movements.history': 'Movements History',

            'dashboard.stock': 'Current Stock',
            'dashboard.history': 'History',

            'reports.title': 'Reports',
            'reports.subtitle': 'Stock analysis and charts',
            'reports.stock': 'Current Stock',
            'reports.movByType': 'Movements by Type',

            'menu.settings': 'Settings',
            'settings.title': 'Settings',
            'settings.subtitle': 'System adjustments',
            'settings.general': 'General Settings',
            'settings.language': 'Language',
            'settings.save': 'Save',
            'settings.saved': 'Settings saved!'
        }
    };

    function getLang(){
        return localStorage.getItem('idioma') || 'pt-BR';
    }

    function t(key){
        const lang = getLang();
        if (translations[lang] && translations[lang][key]) return translations[lang][key];
        // fallback para chave se tradução estiver faltando
        return key;
    }

    function applyTranslations(root=document){
        // elementos com data-i18n -> definir textContent
        root.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = t(key);
        });
        // placeholders
        root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.setAttribute('placeholder', t(key));
        });
        // opções com data-i18n
        root.querySelectorAll('option[data-i18n]').forEach(opt => {
            const key = opt.getAttribute('data-i18n');
            opt.textContent = t(key);
        });
    }

    window.i18n = { t, applyTranslations, getLang };

    function notifyReady() {
        applyTranslations();
        window.dispatchEvent(new Event('i18n:ready'));
    }

    // Aplicar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', notifyReady);
    } else {
        notifyReady();
    }

    // Reaplicar quando idioma muda em outras abas/janelas
    window.addEventListener('storage', (e) => {
        if (e.key === 'idioma') applyTranslations();
    });

    // Reaplicar quando aba recupera foco ou fica visível (ajuda quando cache é limpo)
    window.addEventListener('focus', () => applyTranslations());
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') applyTranslations();
    });

})();
