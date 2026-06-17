import { api, apiFormData, apiList } from './client';
import { API_PATHS } from './paths';

export interface Ato {
    id: string;
    tipo: { id: string; nome: string };
    classificacao?: { id: string; nome: string };
    identificador?: { id: string; nome: string };
    numero: string;
    dataAto?: string;
    dataPublicacao?: string;
    ementa?: string;
    anexoUrl?: string;
    textoUrl?: string;
}

export interface CreateAtoDto {
    tipoId: string;
    classificacaoId?: string;
    identificadorId?: string;
    numero: string;
    dataAto?: string;
    dataPublicacao?: string;
    ementa?: string;
}

export interface AtoFiltros {
    tipoId?: string;
    numero?: string;
    dataInicioDe?: string;
    dataInicioAte?: string;
    dataPublicacaoDe?: string;
    dataPublicacaoAte?: string;
    page?: number;
    limit?: number;
}

export const atosApi = {
    list: (filtros?: AtoFiltros) =>
        apiList<Ato>(API_PATHS.atos, filtros as Record<string, string | number | boolean | undefined>),

    getById: (id: string) =>
        api<Ato>(`${API_PATHS.atos}/${id}`),

    create: (dto: CreateAtoDto) =>
        api<Ato>(API_PATHS.atos, { method: 'POST', body: JSON.stringify(dto) }),

    update: (id: string, dto: Partial<CreateAtoDto>) =>
        api<Ato>(`${API_PATHS.atos}/${id}`, { method: 'PATCH', body: JSON.stringify(dto) }),

    remove: (id: string) =>
        api<void>(`${API_PATHS.atos}/${id}`, { method: 'DELETE' }),

    uploadAnexo: (id: string, file: File) => {
        const fd = new FormData();
        fd.append('file', file);
        return apiFormData<Ato>(`${API_PATHS.atos}/${id}/anexo`, fd, 'POST');
    },
};
