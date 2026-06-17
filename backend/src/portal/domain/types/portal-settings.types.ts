export type PortalSecoes = {
    vereadores: boolean;
    mesaDiretora: boolean;
    comissoes: boolean;
    agenda: boolean;
    normas: boolean;
    materias: boolean;
    transmissao: boolean;
};

export type PortalRedesSociais = {
    facebook?: string;
    instagram?: string;
    youtube?: string;
};

export type PortalCores = {
    primaria?: string;
    secundaria?: string;
};

export type PortalSettings = {
    ativo: boolean;
    titulo: string;
    subtitulo?: string;
    sobre?: string;
    endereco?: string;
    telefone?: string;
    email?: string;
    redesSociais?: PortalRedesSociais;
    cores?: PortalCores;
    bannerUrl?: string;
    secoes: PortalSecoes;
    legislaturaId?: string;
};

export const DEFAULT_PORTAL_SECOES: PortalSecoes = {
    vereadores: true,
    mesaDiretora: true,
    comissoes: true,
    agenda: true,
    normas: true,
    materias: false,
    transmissao: true,
};

export function createDefaultPortalSettings(tenantName: string): PortalSettings {
    return {
        ativo: false,
        titulo: tenantName,
        secoes: { ...DEFAULT_PORTAL_SECOES },
    };
}

export function parsePortalSettings(
    raw: unknown,
    tenantName: string,
): PortalSettings {
    const defaults = createDefaultPortalSettings(tenantName);
    if (!raw || typeof raw !== 'object') {
        return defaults;
    }

    const portal = (raw as { portal?: unknown }).portal ?? raw;
    if (!portal || typeof portal !== 'object') {
        return defaults;
    }

    const p = portal as Record<string, unknown>;
    const secoesRaw = p.secoes;
    const secoes =
        secoesRaw && typeof secoesRaw === 'object'
            ? {
                  ...defaults.secoes,
                  ...(secoesRaw as Partial<PortalSecoes>),
              }
            : defaults.secoes;

    return {
        ativo: typeof p.ativo === 'boolean' ? p.ativo : defaults.ativo,
        titulo:
            typeof p.titulo === 'string' && p.titulo.trim()
                ? p.titulo.trim()
                : defaults.titulo,
        subtitulo:
            typeof p.subtitulo === 'string' ? p.subtitulo : undefined,
        sobre: typeof p.sobre === 'string' ? p.sobre : undefined,
        endereco: typeof p.endereco === 'string' ? p.endereco : undefined,
        telefone: typeof p.telefone === 'string' ? p.telefone : undefined,
        email: typeof p.email === 'string' ? p.email : undefined,
        redesSociais:
            p.redesSociais && typeof p.redesSociais === 'object'
                ? (p.redesSociais as PortalRedesSociais)
                : undefined,
        cores:
            p.cores && typeof p.cores === 'object'
                ? (p.cores as PortalCores)
                : undefined,
        bannerUrl:
            typeof p.bannerUrl === 'string' ? p.bannerUrl : undefined,
        secoes,
        legislaturaId:
            typeof p.legislaturaId === 'string' ? p.legislaturaId : undefined,
    };
}

export function mergePortalSettings(
    current: PortalSettings,
    patch: Partial<PortalSettings>,
): PortalSettings {
    return {
        ...current,
        ...patch,
        redesSociais: patch.redesSociais
            ? { ...current.redesSociais, ...patch.redesSociais }
            : current.redesSociais,
        cores: patch.cores
            ? { ...current.cores, ...patch.cores }
            : current.cores,
        secoes: patch.secoes
            ? { ...current.secoes, ...patch.secoes }
            : current.secoes,
    };
}

export function serializePortalSettings(settings: PortalSettings): {
    portal: PortalSettings;
} {
    return { portal: settings };
}

const PORTAL_SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,58}[a-z0-9])?$/;

export function normalizePortalSlug(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

export function assertValidPortalSlug(slug: string): void {
    if (!PORTAL_SLUG_PATTERN.test(slug)) {
        throw new Error(
            'Slug inválido. Use apenas letras minúsculas, números e hífens (3 a 60 caracteres).',
        );
    }
}
