/**
 * Resolução de host multi-tenant (padrão SistemaSindicatos / Hostinger).
 * Hosts da plataforma: PLATFORM_SEED_HOSTS (ex.: camaragest.stellarsolucoes.com.br).
 * Hosts de câmara: tabela tenant_domains (ex.: baturite.stellarsolucoes.com.br).
 */

export function parseHostList(envValue: string | undefined): string[] {
    if (!envValue?.trim()) return [];
    return envValue
        .split(',')
        .map((h) => normalizeHost(h))
        .filter(Boolean);
}

/** Normaliza host: lowercase, sem porta, sem colchetes IPv6. */
export function normalizeHost(bruto: string): string {
    let host = bruto.trim().toLowerCase();
    if (host.startsWith('[') && host.includes(']')) {
        host = host.slice(1, host.indexOf(']'));
    } else {
        const colon = host.lastIndexOf(':');
        if (colon > -1 && host.indexOf(':') === colon) {
            host = host.slice(0, colon);
        }
    }
    return host;
}

export function platformSeedHosts(): string[] {
    return parseHostList(process.env.PLATFORM_SEED_HOSTS);
}

export function tenantSeedHosts(): string[] {
    return parseHostList(process.env.TENANT_SEED_HOSTS);
}

export function isPlatformHost(host: string | undefined | null): boolean {
    if (!host) return false;
    const normalized = normalizeHost(host);
    return platformSeedHosts().includes(normalized);
}

/**
 * Extrai o host do front a partir dos headers da requisição.
 * Prioridade: X-Tenant-Host → Origin → X-Forwarded-Host → Host.
 */
export function extractTenantHost(
    headers: Record<string, string | string[] | undefined>,
): string | undefined {
    const header = (nome: string): string | undefined => {
        const v = headers[nome] ?? headers[nome.toLowerCase()];
        if (Array.isArray(v)) return v[0];
        return v;
    };

    const xTenantHost = header('x-tenant-host');
    if (xTenantHost) return normalizeHost(xTenantHost);

    const origin = header('origin');
    if (origin) {
        try {
            return normalizeHost(new URL(origin).host);
        } catch {
            /* ignore */
        }
    }

    const forwarded = header('x-forwarded-host');
    if (forwarded) {
        return normalizeHost(forwarded.split(',')[0]!.trim());
    }

    const host = header('host');
    if (host) return normalizeHost(host);

    return undefined;
}
