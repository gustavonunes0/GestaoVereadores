import { api, apiFormData, apiList } from '../client';
import { API_PATHS } from '../paths';
import type { MateriaStatus } from '../../types/legislative';

export interface AutorMateria {
    id: string;
    tipo: 'parlamentar' | 'externo';
    nome: string;
    parlamentarId?: string;
    autorExternoId?: string;
}

export interface TramitacaoItem {
    id: string;
    data: string;
    statusAnterior?: MateriaStatus;
    statusNovo: MateriaStatus;
    descricao?: string;
    responsavel?: string;
}

export interface Materia {
    id: string;
    identificacao: string;
    sigla?: string;
    tipo: { id: string; nome: string; sigla?: string };
    numero: string;
    ano: number;
    ementa: string;
    status: MateriaStatus;
    dataProtocolo?: string;
    textoOriginalUrl?: string;
    autor?: AutorMateria;
    autoresAdicionais?: AutorMateria[];
    relatores?: Array<{ id: string; nome: string; parlamentarId: string }>;
    tramitacaoHistorico?: TramitacaoItem[];
}

export interface CreateMateriaDto {
    tipoId: string;
    numero?: string;
    anoId?: string;
    ementa: string;
    origemId?: string;
    tematicaId?: string;
    dataProtocolo?: string;
    justificativa?: string;
    autorParliamentarianId?: string;
    autorExternoId?: string;
    autorGuestUserId?: string;
}

export interface MateriaFiltros {
    tipoId?: string;
    numero?: string;
    numeroProtocolo?: string;
    anoId?: string;
    status?: MateriaStatus;
    ementa?: string;
    tipoAutorId?: string;
    dataInicio?: string;
    dataFim?: string;
    dataPublicacaoInicio?: string;
    dataPublicacaoFim?: string;
    page?: number;
    limit?: number;
}

export const materiasApi = {
    list: (filtros?: MateriaFiltros) =>
        apiList<Materia>(API_PATHS.legislative.materias, filtros as Record<string, string | number | boolean | undefined>),

    getById: (id: string) =>
        api<Materia>(`${API_PATHS.legislative.materias}/${id}`),

    create: (dto: CreateMateriaDto | Record<string, unknown>) =>
        api<Materia>(API_PATHS.legislative.materias, { method: 'POST', body: JSON.stringify(dto) }),

    createComTexto: (dto: CreateMateriaDto & { textoOriginal?: File }) => {
        const { textoOriginal, ...rest } = dto;
        const fd = new FormData();
        for (const [key, value] of Object.entries(rest)) {
            if (value !== undefined) fd.append(key, String(value));
        }
        if (textoOriginal) fd.append('textoOriginal', textoOriginal);
        return apiFormData<Materia>(API_PATHS.legislative.materias, fd, 'POST');
    },

    update: (id: string, dto: Partial<CreateMateriaDto>) =>
        api<Materia>(`${API_PATHS.legislative.materias}/${id}`, { method: 'PATCH', body: JSON.stringify(dto) }),

    remove: (id: string) =>
        api<void>(`${API_PATHS.legislative.materias}/${id}`, { method: 'DELETE' }),

    tramitar: (id: string, dto: { statusNovo: MateriaStatus; descricao?: string }) =>
        api<Materia>(API_PATHS.materiasTramitar(id), { method: 'POST', body: JSON.stringify(dto) }),

    adicionarAutor: (id: string, dto: { autorExternoId?: string; parlamentarId?: string; tipoAutorId?: string }) =>
        api<Materia>(API_PATHS.materiasAutores(id), { method: 'POST', body: JSON.stringify(dto) }),

    addPublicacao: (id: string, dto: Record<string, unknown>) =>
        api<Materia>(API_PATHS.materiasPublicacoes(id), { method: 'POST', body: JSON.stringify(dto) }),
};
