import { api, apiFormData, apiList } from './client';
import { API_PATHS } from './paths';
import type { NormaStatus } from '../types/legislative';

export interface Norma {
    id: string;
    tipo: { id: string; nome: string };
    numero: string;
    ano: number;
    ementa: string;
    statusDerived: NormaStatus;
    dataSancao?: string;
    dataVeto?: string;
    dataPromulgacao?: string;
    dataPublicacao?: string;
    dataVigencia?: string;
    dataRevogacao?: string;
    complementar: boolean;
    textoIntegralUrl?: string;
    audioUrl?: string;
    materiaOrigem?: { id: string; identificacao: string };
    esferaFederacao?: { id: string; nome: string };
}

export interface CreateNormaDto {
    tipoId: string;
    numero: string;
    anoId: string;
    esferaFederacaoId: string;
    ementa: string;
    complementar?: boolean;
    materiaOrigemId?: string;
    dataPublicacao?: string;
    veiculoPublicacao?: string;
    paginaInicio?: number;
    paginaFim?: number;
    identificadorId?: string;
    urlExternaPublicacao?: string;
}

export interface NormaFiltros {
    tipoId?: string;
    numero?: string;
    ano?: number;
    dataInicio?: string;
    dataFim?: string;
    dataPublicacaoInicio?: string;
    dataPublicacaoFim?: string;
    esferaFederacaoId?: string;
    ementa?: string;
    page?: number;
    limit?: number;
}

export const normasApi = {
    list: (filtros?: NormaFiltros) =>
        apiList<Norma>(API_PATHS.normas, filtros as Record<string, string | number | boolean | undefined>),

    getById: (id: string) =>
        api<Norma>(`${API_PATHS.normas}/${id}`),

    create: (dto: CreateNormaDto) =>
        api<Norma>(API_PATHS.normas, { method: 'POST', body: JSON.stringify(dto) }),

    update: (id: string, dto: Partial<CreateNormaDto>) =>
        api<Norma>(`${API_PATHS.normas}/${id}`, { method: 'PATCH', body: JSON.stringify(dto) }),

    remove: (id: string) =>
        api<void>(`${API_PATHS.normas}/${id}`, { method: 'DELETE' }),

    uploadTextoIntegral: (id: string, file: File) => {
        const fd = new FormData();
        fd.append('file', file);
        return apiFormData<Norma>(`${API_PATHS.normas}/${id}/texto-integral`, fd, 'POST');
    },

    uploadAudio: (id: string, file: File) => {
        const fd = new FormData();
        fd.append('file', file);
        return apiFormData<Norma>(`${API_PATHS.normas}/${id}/audio`, fd, 'POST');
    },

    registrarSancao: (id: string, dataSancao: string) =>
        api<Norma>(API_PATHS.normasSancao(id), {
            method: 'POST',
            body: JSON.stringify({ dataSancao }),
        }),

    registrarVeto: (id: string, dto: { dataVeto: string; tipoVeto: string; motivoVeto?: string }) =>
        api<Norma>(API_PATHS.normasVeto(id), {
            method: 'POST',
            body: JSON.stringify(dto),
        }),

    registrarPromulgacao: (id: string, dataPromulgacao: string) =>
        api<Norma>(API_PATHS.normasPromulgacao(id), {
            method: 'POST',
            body: JSON.stringify({ dataPromulgacao }),
        }),

    registrarPublicacao: (id: string, dto: { dataPublicacao: string; veiculoPublicacao?: string }) =>
        api<Norma>(API_PATHS.normasPublicacao(id), {
            method: 'POST',
            body: JSON.stringify(dto),
        }),

    revogar: (id: string, dataRevogacao: string) =>
        api<Norma>(API_PATHS.normasRevogar(id), {
            method: 'POST',
            body: JSON.stringify({ dataRevogacao }),
        }),
};
