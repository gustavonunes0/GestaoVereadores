const RELOAD_KEY = 'sigl:chunk-reload-at';
/** Evita loop de reload se o chunk continuar indisponível após recarregar. */
const RELOAD_COOLDOWN_MS = 30_000;

export function isChunkLoadError(error: unknown): boolean {
    const message =
        error instanceof Error ? error.message : typeof error === 'string' ? error : '';
    return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS/i.test(
        message,
    );
}

/**
 * Após um deploy, a aba aberta ainda referencia chunks com hash antigo que
 * já não existem no servidor. Recarrega uma vez para buscar o index.html novo.
 * Retorna `false` se já recarregou há pouco (o erro deve ser exibido).
 */
export function reloadForStaleChunk(): boolean {
    try {
        const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
        if (Date.now() - last < RELOAD_COOLDOWN_MS) return false;
        sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    } catch {
        // sessionStorage indisponível: recarrega mesmo assim.
    }
    window.location.reload();
    return true;
}

export function importWithReload<T>(factory: () => Promise<T>): () => Promise<T> {
    return () =>
        factory().catch((error: unknown) => {
            if (isChunkLoadError(error) && reloadForStaleChunk()) {
                return new Promise<T>(() => {});
            }
            throw error;
        });
}
