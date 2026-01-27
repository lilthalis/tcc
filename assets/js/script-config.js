// Selecionar elementos
const configForm = document.getElementById('configForm');
const apiUrlInput = document.getElementById('apiUrl');
const idiomaSelect = document.getElementById('idioma');

// Carregar configurações
const savedApiBase = localStorage.getItem('apiBase') || 'http://localhost:8080/api';
const savedIdioma = localStorage.getItem('idioma') || 'pt-BR';
apiUrlInput.value = savedApiBase;
idiomaSelect.value = savedIdioma;

// Aplicar traduções locais usando i18n
function applyLocalTranslations() {
    if (window.i18n && typeof i18n.applyTranslations === 'function') {
        i18n.applyTranslations(document);
    }
}

if (window.i18n && typeof i18n.applyTranslations === 'function') {
    applyLocalTranslations();
} else {
    window.addEventListener('i18n:ready', applyLocalTranslations);
}

// Evento de mudança de idioma (preview imediato)
idiomaSelect.addEventListener('change', () => {
    const newIdioma = idiomaSelect.value;
    localStorage.setItem('idioma', newIdioma);
    applyLocalTranslations();
});

// Evento de salvar
configForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newApiUrl = apiUrlInput.value.trim();
    const newIdioma = idiomaSelect.value;
    if (newApiUrl) {
        localStorage.setItem('apiBase', newApiUrl);
        localStorage.setItem('idioma', newIdioma);
        applyLocalTranslations();
        const msg = (window.i18n && typeof i18n.t === 'function') ? i18n.t('settings.saved') : 'Configurações salvas! Reinicie a aplicação para aplicar.';
        alert(msg);
    }
});