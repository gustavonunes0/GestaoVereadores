/**
 * Host multi-tenant no front (espelha SistemaSindicatos).
 * Plataforma: camaragest.stellarsolucoes.com.br
 * Tenant: baturite.stellarsolucoes.com.br (e demais em tenant_domains)
 */

const DEFAULT_PLATFORM_HOSTS = ['camaragest.stellarsolucoes.com.br'];

function parseHostList(raw: string | undefined): string[] {
    if (!raw?.trim()) return [];
    return raw
        .split(',')
        .map((h) => h.trim().toLowerCase())
        .filter(Boolean);
}

/** Hosts da plataforma (VITE_PLATFORM_HOSTS ou default CâmaraGest). */
export function platformHosts(): string[] {
    const fromEnv = parseHostList(import.meta.env.VITE_PLATFORM_HOSTS as string | undefined);
    return fromEnv.length ? fromEnv : DEFAULT_PLATFORM_HOSTS;
}

export function currentHostname(): string {
    if (typeof window === 'undefined') return 'localhost';
    return window.location.hostname.toLowerCase();
}

/** Header enviado à API para resolver o tenant (mesmo padrão do SindiGest). */
export function tenantHostHeader(): string {
    return currentHostname();
}

export function isPlatformHostname(host = currentHostname()): boolean {
    const h = host.toLowerCase();
    if (platformHosts().includes(h)) return true;
    return h === 'camaragest.stellarsolucoes.com.br' || h.startsWith('camaragest.');
}
