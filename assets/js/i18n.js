// Simple i18n helper
(function(){
    const translations = {
        'pt-BR': {
            'logo': '📦 StockFlow',
            'menu.dashboard': 'Dashboard',
            'menu.mov': 'Movimentações',
            'menu.reports': 'Relatórios',
            'menu.settings': 'Configurações',

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

            'settings.title': 'Configurações',
            'settings.subtitle': 'Ajustes do sistema',
            'settings.general': 'Configurações Gerais',
            'settings.apiUrl': 'URL da API',
            'settings.apiUrl.placeholder': 'http://localhost:8080/api',
            'settings.language': 'Idioma',
            'settings.save': 'Salvar',
            'settings.saved': 'Configurações salvas! Reinicie a aplicação para aplicar.'
        },
        'en': {
            'logo': '📦 StockFlow',
            'menu.dashboard': 'Dashboard',
            'menu.mov': 'Movements',
            'menu.reports': 'Reports',
            'menu.settings': 'Settings',

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

            'settings.title': 'Settings',
            'settings.subtitle': 'System adjustments',
            'settings.general': 'General Settings',
            'settings.apiUrl': 'API URL',
            'settings.apiUrl.placeholder': 'http://localhost:8080/api',
            'settings.language': 'Language',
            'settings.save': 'Save',
            'settings.saved': 'Settings saved! Restart the application to apply.'
        }
    };

    function getLang(){
        return localStorage.getItem('idioma') || 'pt-BR';
    }

    function t(key){
        const lang = getLang();
        if (translations[lang] && translations[lang][key]) return translations[lang][key];
        // fallback to key if missing
        return key;
    }

    function applyTranslations(root=document){
        // elements with data-i18n -> set textContent
        root.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = t(key);
        });
        // placeholders
        root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.setAttribute('placeholder', t(key));
        });
        // options with data-i18n
        root.querySelectorAll('option[data-i18n]').forEach(opt => {
            const key = opt.getAttribute('data-i18n');
            opt.textContent = t(key);
        });
    }

    window.i18n = { t, applyTranslations, getLang };

    // apply on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        applyTranslations();
    });

    // Reapply when language changed in other tabs/windows
    window.addEventListener('storage', (e) => {
        if (e.key === 'idioma') applyTranslations();
    });

    // Reapply when tab regains focus or becomes visible (helps when cache is cleared)
    window.addEventListener('focus', () => applyTranslations());
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') applyTranslations();
    });

    // Notify other scripts that i18n is ready
    window.dispatchEvent(new Event('i18n:ready'));

})();
