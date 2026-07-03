/**
 * Base URL do servidor Socket.IO (sem namespace).
 * Deriva de VITE_API_URL ou VITE_SOCKET_URL; em Docker/nginx usa mesma origem.
 */
export function resolveSocketBaseUrl(): string {
    const explicit = import.meta.env.VITE_SOCKET_URL as string | undefined;
    if (explicit?.trim()) {
        return explicit.trim().replace(/\/$/, '');
    }

    const apiUrl = import.meta.env.VITE_API_URL ?? '/api';
    if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
        return '';
    }

    const url = new URL(apiUrl);
    if (url.pathname.endsWith('/api')) {
        url.pathname = url.pathname.slice(0, -4) || '/';
    } else if (url.pathname.endsWith('/api/')) {
        url.pathname = url.pathname.slice(0, -5) || '/';
    }
    const path = url.pathname.replace(/\/$/, '');
    return `${url.origin}${path === '' || path === '/' ? '' : path}`;
}
