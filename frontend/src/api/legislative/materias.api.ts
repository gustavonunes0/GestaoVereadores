import { api, apiFormData, apiList } from '../client';
import { API_PATHS } from '../paths';
import type { MateriaStatus } from '../../types/legislative';
import type { CoautorMateria } from '../../types/materias';

export interface MatterTenantPartnerOption {
    id: string;
    nome: string;
    nomeExibicao: string;
    cargo?: string;
    instituicao?: string;
    registro?: string;
    partido?: string;
    uf?: string;
    usuarioVinculado?: boolean;
    usuario?: {
        nome: string;
        cpf: string;
        fotoPerfil?: string | null;
    } | null;
    tipoAutor?: { id: string; nome: string; idNegocio: number };
}

export interface MatterAuthorOption {
    id: string;
    label: string;
    kind: 'parliamentarian' | 'external';
}

export interface MatterAuthorOptionsResponse {
    kind: 'parliamentarian' | 'external';
    options: MatterAuthorOption[];
}

export interface MatterAuthorship {
    matterId: string;
    primaryAuthor?: {
        type: 'parliamentarian' | 'external';
        label: string;
        parliamentarian?: { id: string; parliamentaryName: string };
        tenantPartner?: { id: string; nome: string; tipoAutorId?: string };
        autorId?: string;
    };
    coauthors?: Array<{
        id: string;
        ordem: number;
        parliamentarian: { id: string; parliamentaryName: string };
    }>;
}

export interface AutorMateria {
    id: string;
    tipo: 'parlamentar' | 'externo';
    nome: string;
    parlamentarId?: string;
    autorExternoId?: string;
    photoUrl?: string | null;
    subtitulo?: string | null;
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
    identificacao?: string;
    sigla?: string;
    tipo: { id: string; nome: string; sigla?: string };
    numero: number | string | null;
    numeroProtocolo?: number | string | null;
    ano: number | { id: string; valor: number } | null;
    ementa: string;
    status: MateriaStatus | { value: MateriaStatus; label: string };
    dataProtocolo?: string | null;
    textoOriginalUrl?: string | null;
    autor?: AutorMateria | null;
    authorship?: {
        authorParliamentarian?: {
            id: string;
            parliamentaryName: string;
            officeNumber?: string | null;
            photoUrl?: string | null;
        } | null;
        rapporteurParliamentarian?: {
            id: string;
            parliamentaryName: string;
            photoUrl?: string | null;
        } | null;
        coauthors?: Array<{
            id: string;
            ordem: number;
            parliamentarian: {
                id: string;
                parliamentaryName: string;
                photoUrl?: string | null;
            };
        }>;
    };
    statusTramitacao?: { id: string; nome: string } | null;
    unidadeTramitacao?: { id: string; nome: string } | null;
    ultimaTramitacao?: {
        data: string;
        status: MateriaStatus;
        observacao?: string | null;
    } | null;
    autoresAdicionais?: AutorMateria[];
    relator?: { id: string; nome: string; parlamentarId: string } | null;
    relatores?: Array<{ id: string; nome: string; parlamentarId: string }>;
    tramitacaoHistorico?: TramitacaoItem[];
    workflow?: {
        tramitacao?: Array<{
            em?: string;
            status?: MateriaStatus;
            observacao?: string;
        }>;
    };
}

export interface CreateMateriaDto {
    tipoId: string;
    numero?: number;
    anoId?: string;
    ementa: string;
    origemId?: string;
    tematicaId?: string;
    dataProtocolo?: string;
    justificativa?: string;
    status?: MateriaStatus;
    authorParliamentarianId?: string;
    tenantPartnerId?: string;
    autorExternoId?: string;
    coautorIds?: string[];
    relatoresIds?: string[];
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
        apiList<Materia>(API_PATHS.materias, filtros as Record<string, string | number | boolean | undefined>),

    getById: (id: string) =>
        api<Materia>(`${API_PATHS.materias}/${id}`),

    create: (dto: CreateMateriaDto | Record<string, unknown>) =>
        api<Materia>(API_PATHS.materias, { method: 'POST', body: JSON.stringify(dto) }),

    createComTexto: (dto: CreateMateriaDto & { textoOriginal?: File }) => {
        const { textoOriginal, ...rest } = dto;
        const fd = new FormData();
        for (const [key, value] of Object.entries(rest)) {
            if (value !== undefined) fd.append(key, String(value));
        }
        if (textoOriginal) fd.append('textoOriginal', textoOriginal);
        return apiFormData<Materia>(API_PATHS.materias, fd, 'POST');
    },

    update: (id: string, dto: Partial<CreateMateriaDto>) =>
        api<Materia>(`${API_PATHS.materias}/${id}`, { method: 'PATCH', body: JSON.stringify(dto) }),

    remove: (id: string) =>
        api<void>(`${API_PATHS.materias}/${id}`, { method: 'DELETE' }),

    tramitar: (
        id: string,
        dto: { novoStatus: MateriaStatus; observacao?: string; despacho?: string },
    ) =>
        api<Materia>(API_PATHS.materiasTramitar(id), {
            method: 'POST',
            body: JSON.stringify(dto),
        }),

    adicionarAutor: (id: string, dto: { autorExternoId?: string; parlamentarId?: string; tipoAutorId?: string }) =>
        api<Materia>(API_PATHS.materiasAutores(id), { method: 'POST', body: JSON.stringify(dto) }),

    addPublicacao: (id: string, dto: Record<string, unknown>) =>
        api<Materia>(API_PATHS.materiasPublicacoes(id), { method: 'POST', body: JSON.stringify(dto) }),

    listOpcoesAutor: (tipoAutorId: string) =>
        api<MatterAuthorOptionsResponse>(
            `${API_PATHS.materiasOpcoesAutor}?tipoAutorId=${encodeURIComponent(tipoAutorId)}`,
        ),

    /** Instituições parceiras para autoria — acessível a parlamentares e staff. */
    listTenantPartners: (tipoAutorId?: string) => {
        const qs = tipoAutorId
            ? `?tipoAutorId=${encodeURIComponent(tipoAutorId)}`
            : '';
        return api<MatterTenantPartnerOption[]>(
            `${API_PATHS.materiasListarTenantPartners}${qs}`,
        );
    },

    getAutoria: (id: string) =>
        api<MatterAuthorship>(API_PATHS.materiasAutoria(id)),

    setAutorParlamentar: (id: string, parliamentarianId: string) =>
        api<MatterAuthorship>(API_PATHS.materiasAutoriaParlamentar(id), {
            method: 'PUT',
            body: JSON.stringify({ parliamentarianId }),
        }),

    setTenantPartner: (id: string, tenantPartnerId: string) =>
        api<MatterAuthorship>(API_PATHS.materiasAutoriaExterno(id), {
            method: 'PUT',
            body: JSON.stringify({ tenantPartnerId }),
        }),

    uploadTextoOriginal: (id: string, file: File) => {
        const fd = new FormData();
        fd.append('textoOriginal', file);
        return apiFormData<Materia>(API_PATHS.materiasTextoOriginal(id), fd);
    },

    listCoautores: (id: string) =>
        api<CoautorMateria[]>(API_PATHS.materiaCoautores(id)),

    addCoautor: (id: string, dto: { parliamentarianId: string }) =>
        api<CoautorMateria>(API_PATHS.materiaCoautores(id), { method: 'POST', body: JSON.stringify(dto) }),

    removeCoautor: (materiaId: string, coautorId: string) =>
        api<void>(API_PATHS.materiaCoautorById(materiaId, coautorId), { method: 'DELETE' }),
};
