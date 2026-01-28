// Botão de troca de idioma no aside
(function(){
    console.log('Script language loaded');

    function initLanguageButton() {
        console.log('initLanguageButton called');
        const languageBtn = document.getElementById('languageBtn');
        console.log('Language button found:', languageBtn);
        if (!languageBtn) return;

        // Verificar se já foi inicializado
        if (languageBtn.dataset.initialized) return;
        languageBtn.dataset.initialized = 'true';

        // Atualizar texto do botão baseado no idioma atual
        function updateButtonText() {
            const currentLang = localStorage.getItem('idioma') || 'pt-BR';
            languageBtn.textContent = currentLang === 'pt-BR' ? '🌐 PT' : '🌐 EN';
            languageBtn.title = currentLang === 'pt-BR' ? 'Switch to English' : 'Mudar para Português';
        }

        updateButtonText();

        languageBtn.addEventListener('click', () => {
            console.log('Language button clicked');
            const currentLang = localStorage.getItem('idioma') || 'pt-BR';
            const newLang = currentLang === 'pt-BR' ? 'en' : 'pt-BR';
            console.log('Switching from', currentLang, 'to', newLang);

            localStorage.setItem('idioma', newLang);

            // Notificar outras abas/janelas
            window.dispatchEvent(new StorageEvent('storage', { key: 'idioma', newValue: newLang }));

            // Aplicar traduções
            if (window.i18n && typeof i18n.applyTranslations === 'function') {
                console.log('Applying translations');
                i18n.applyTranslations(document);
            } else {
                console.log('i18n not available, retrying in 100ms');
                setTimeout(() => {
                    if (window.i18n && typeof i18n.applyTranslations === 'function') {
                        i18n.applyTranslations(document);
                    }
                }, 100);
            }

            updateButtonText();
        });
    }

    // Inicializar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLanguageButton);
    } else {
        initLanguageButton();
    }

    // Re-inicializar quando navegar via SPA
    window.addEventListener('app:navigated', () => {
        setTimeout(initLanguageButton, 50); // Pequeno delay para garantir que o DOM foi atualizado
    });
})();