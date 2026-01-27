(function(){
    // Lightweight SPA router: fetches pages and swaps <main> content
    async function navigateTo(url, push = true){
        document.documentElement.classList.add('is-navigating');
        try{
            const res = await fetch(url, { cache: 'no-store' });
            if (!res.ok) throw new Error('Network error: ' + res.status);
            const html = await res.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newMain = doc.querySelector('main');
            if (newMain) {
                const main = document.querySelector('main');
                main.innerHTML = newMain.innerHTML;
            }
            // update title
            document.title = doc.title || document.title;
            if (push) history.pushState({ url }, '', url);

            // reapply translations and notify others
            if (window.i18n && typeof i18n.applyTranslations === 'function') i18n.applyTranslations(document);
            window.dispatchEvent(new CustomEvent('app:navigated', { detail: { url } }));
        } catch (err) {
            console.error(err);
            // fallback to full navigation
            window.location.href = url;
        } finally {
            setTimeout(() => document.documentElement.classList.remove('is-navigating'), 60);
        }
    }

    document.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (!a) return;
        const href = a.getAttribute('href');
        if (!href) return;
        // ignore external links and anchors
        if (href.startsWith('http') && !href.startsWith(location.origin)) return;
        if (a.target === '_blank') return;
        if (href.startsWith('#')) return;

        e.preventDefault();
        navigateTo(a.href);
    });

    window.addEventListener('popstate', (e) => {
        const url = (e.state && e.state.url) || location.href;
        navigateTo(url, false);
    });

    // expose a programmatic navigate function
    window.appRouter = { navigateTo };
})();