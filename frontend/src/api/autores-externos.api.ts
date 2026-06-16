import { api, apiList } from './client';
import { API_PATHS } from './paths';

export interface AutorExterno {
    id: string;
    tipoAutor: { id: string; nome: string; idNegocio?: number };
    nome: string;
    cargo?: string;
    instituicao?: string;
    cpf?: string;
    email?: string;
    telefone?: string;
    registro?: string;
    partido?: string;
    uf?: string;
    isRemoved: boolean;
}

export interface CreateAutorExternoDto {
    tipoAutorId: string;
    nome: string;
    cargo?: string;
    instituicao?: string;
    cpf?: string;
    email?: string;
    telefone?: string;
    registro?: string;
    partido?: string;
    uf?: string;
}

export interface AutorExternoFiltros {
    tipoAutorId?: string;
    nome?: string;
    page?: number;
    limit?: number;
}

export const autoresExternosApi = {
    list: (filtros?: AutorExternoFiltros) =>
        apiList<AutorExterno>(API_PATHS.autoresExternos, filtros as Record<string, string | number | boolean | undefined>),

    getById: (id: string) =>
        api<AutorExterno>(`${API_PATHS.autoresExternos}/${id}`),

    create: (dto: CreateAutorExternoDto) =>
        api<AutorExterno>(API_PATHS.autoresExternos, { method: 'POST', body: JSON.stringify(dto) }),

    update: (id: string, dto: Partial<CreateAutorExternoDto>) =>
        api<AutorExterno>(`${API_PATHS.autoresExternos}/${id}`, { method: 'PATCH', body: JSON.stringify(dto) }),

    remove: (id: string) =>
        api<void>(`${API_PATHS.autoresExternos}/${id}`, { method: 'DELETE' }),
};
