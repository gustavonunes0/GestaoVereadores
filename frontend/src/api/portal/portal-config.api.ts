import { api } from '../client';
import { API_PATHS } from '../paths';

export type PortalSecoes = {
    vereadores: boolean;
    mesaDiretora: boolean;
    comissoes: boolean;
    agenda: boolean;
    normas: boolean;
    materias: boolean;
    transmissao: boolean;
};

export type PortalSettings = {
    ativo: boolean;
    titulo: string;
    subtitulo?: string;
    sobre?: string;
    endereco?: string;
    telefone?: string;
    email?: string;
    redesSociais?: {
        facebook?: string;
        instagram?: string;
        youtube?: string;
    };
    cores?: {
        primaria?: string;
        secundaria?: string;
    };
    bannerUrl?: string;
    secoes: PortalSecoes;
    legislaturaId?: string;
};

export type PortalConfig = {
    portalSlug: string | null;
    name: string;
    logo: string | null;
    portal: PortalSettings;
    previewUrl: string | null;
};

export type UpdatePortalConfigDto = {
    portalSlug?: string | null;
    portal?: Partial<PortalSettings>;
};

export const portalConfigApi = {
    get: () => api<PortalConfig>(API_PATHS.portalConfig),

    update: (dto: UpdatePortalConfigDto) =>
        api<PortalConfig>(API_PATHS.portalConfig, {
            method: 'PATCH',
            body: JSON.stringify(dto),
        }),

    previewUrl: () =>
        api<{ url: string | null }>(API_PATHS.portalConfigPreviewUrl),
};
