(function() {
    let configForm, idiomaSelect;

    function selectElements() {
        configForm = document.getElementById('configForm');
        idiomaSelect = document.getElementById('idioma');

        if (idiomaSelect) {
            const savedIdioma = localStorage.getItem('idioma') || 'pt-BR';
            idiomaSelect.value = savedIdioma;

            idiomaSelect.removeEventListener('change', onIdiomaChange);
            idiomaSelect.addEventListener('change', onIdiomaChange);
        }

        if (configForm) {
            configForm.removeEventListener('submit', onConfigSubmit);
            configForm.addEventListener('submit', onConfigSubmit);
        }
    }

    function onIdiomaChange() {
        const newIdioma = idiomaSelect.value;
        localStorage.setItem('idioma', newIdioma);
        window.dispatchEvent(new StorageEvent('storage', { key: 'idioma', newValue: newIdioma }));
        if (window.i18n && typeof i18n.applyTranslations === 'function') {
            i18n.applyTranslations(document);
        }
    }

    function onConfigSubmit(e) {
        e.preventDefault();
        onIdiomaChange();
        const msg = (window.i18n && typeof i18n.t === 'function') ? i18n.t('settings.saved') : 'Configurações salvas!';
        alert(msg);
    }

    function init() {
        selectElements();
        if (window.i18n && typeof i18n.applyTranslations === 'function') {
            i18n.applyTranslations(document);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.addEventListener('i18n:ready', init);

    window.addEventListener('app:navigated', (e) => {
        const url = (e.detail && e.detail.url) || location.pathname;
        if (url.includes('configuracoes.html')) {
            init();
        }
    });
})();
