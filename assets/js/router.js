(function(){
    // Roteador SPA leve: busca páginas e troca conteúdo <main>
    async function navigateTo(url, push = true){
        document.documentElement.classList.add('is-navigating');
        console.log('[Router] Navegando para:', url, 'Caminho atual:', location.pathname);
        try{
            const res = await fetch(url, { cache: 'no-store' });
            console.log('[Router] Fetch concluído. Status:', res.status, 'URL:', res.url);
            if (!res.ok) throw new Error('Erro de rede: ' + res.status);
            const html = await res.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newMain = doc.querySelector('main');
            if (newMain) {
                const main = document.querySelector('main');
                main.innerHTML = newMain.innerHTML;
            }
            // atualizar título
            document.title = doc.title || document.title;
            if (push) history.pushState({ url }, '', url);

            // reaplicar traduções e notificar outros
            if (window.i18n && typeof i18n.applyTranslations === 'function') i18n.applyTranslations(document);
            window.dispatchEvent(new CustomEvent('app:navigated', { detail: { url } }));
        } catch (err) {
            console.error('Erro do router:', err);
            // fallback para navegação completa
            window.location.href = url;
        } finally {
            setTimeout(() => document.documentElement.classList.remove('is-navigating'), 60);
        }
    }

    document.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (!a) return;
        let href = a.getAttribute('href');
        if (!href) return;
        console.log('[Router] Link clicado:', href, 'Caminho atual:', location.pathname);
        // ignorar links externos e âncoras
        if (href.startsWith('http')) return;
        if (a.target === '_blank') return;
        if (href.startsWith('#')) return;

        // Converter caminhos relativos em absolutos (para links na pasta pages/)
        // Pular se já for absoluto (começa com /)
        if (!href.startsWith('/')) {
            href = '/' + href;
            console.log('[Router] Convertido relativo para absoluto:', href);
        }

        e.preventDefault();
        navigateTo(href);
    });

    window.addEventListener('popstate', (e) => {
        const url = (e.state && e.state.url) || location.pathname;
        navigateTo(url, false);
    });

    // expor uma função de navegação programática
    window.appRouter = { navigateTo };
})();