/** URL HTTPS da instância Jitsi (para aceitar certificado self-signed no navegador). */
export function buildJitsiOrigin(domain: string): string {
    const host = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `https://${host}`;
}

/**
 * Carrega `external_api.js` antes do `<JitsiMeeting />`.
 * Em dev usa proxy do Vite (`/__jitsi`) para evitar bloqueio do certificado self-signed no script.
 * O iframe da sala ainda exige aceitar o certificado em `buildJitsiOrigin(domain)` uma vez.
 */
export function ensureJitsiExternalApi(domain: string): Promise<void> {
    if (window.JitsiMeetExternalAPI) {
        return Promise.resolve();
    }

    const host = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const scriptUrl = import.meta.env.DEV
        ? `${window.location.origin}/__jitsi/external_api.js`
        : `https://${host}/external_api.js`;

    return new Promise((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(
            `script[data-jitsi-external-api="${scriptUrl}"]`,
        );
        if (existing) {
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener(
                'error',
                () => reject(new Error(`Script load error: ${scriptUrl}`)),
                { once: true },
            );
            return;
        }

        const script = document.createElement('script');
        script.async = true;
        script.src = scriptUrl;
        script.dataset.jitsiExternalApi = scriptUrl;
        script.onload = () => {
            if (window.JitsiMeetExternalAPI) {
                resolve();
                return;
            }
            reject(new Error('JitsiMeetExternalAPI não ficou disponível após carregar o script'));
        };
        script.onerror = () => reject(new Error(`Script load error: ${scriptUrl}`));
        document.head.appendChild(script);
    });
}

export function isJitsiScriptLoadError(message: string): boolean {
    return /script load error/i.test(message) || /external_api\.js/i.test(message);
}
