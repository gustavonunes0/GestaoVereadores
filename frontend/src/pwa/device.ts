/** Detecção de ambiente PWA / iOS — usada no login e no banner de instalação. */

export function isStandaloneDisplay(): boolean {
    if (typeof window === 'undefined') return false;
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        ('standalone' in navigator &&
            Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
    );
}

export function isIosDevice(): boolean {
    if (typeof navigator === 'undefined') return false;
    return (
        /iphone|ipad|ipod/i.test(navigator.userAgent) ||
        (/macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1)
    );
}

/** Safari (não Chrome/Firefox no iOS) — “Adicionar à Tela de Início” é confiável aqui. */
export function isIosSafari(): boolean {
    if (!isIosDevice()) return false;
    const ua = navigator.userAgent;
    const isWebkit = /applewebkit/i.test(ua);
    const isCriOS = /crios/i.test(ua);
    const isFxiOS = /fxios/i.test(ua);
    const isEdgiOS = /edgios/i.test(ua);
    return isWebkit && !isCriOS && !isFxiOS && !isEdgiOS;
}
