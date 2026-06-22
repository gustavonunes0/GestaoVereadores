import type { MateriaStatus } from './legislative';
import { MATERIA_STATUS_LABELS } from './legislative';

/** Alias alinhado ao enum StatusMateria do backend (Prisma). */
export type StatusMateria = MateriaStatus;

export const STATUS_MATERIA_LABELS = MATERIA_STATUS_LABELS;

const STATUS_TRAMITAR_GRAPH: Record<MateriaStatus, MateriaStatus[]> = {
    DRAFT: ['PROTOCOLADA'],
    PROTOCOLADA: ['EM_TRAMITACAO'],
    EM_TRAMITACAO: ['EM_PAUTA', 'ARQUIVADA', 'RETIRADA'],
    EM_PAUTA: ['APROVADA', 'REJEITADA', 'EM_TRAMITACAO'],
    APROVADA: ['TRANSFORMADA_EM_NORMA'],
    REJEITADA: [],
    ARQUIVADA: [],
    RETIRADA: [],
    TRANSFORMADA_EM_NORMA: [],
};

export function gerarOpcoesStatus(statusAtual: MateriaStatus): MateriaStatus[] {
    const next = STATUS_TRAMITAR_GRAPH[statusAtual] ?? [];
    return [statusAtual, ...next];
}

export function statusTransicaoPermitida(
    de: MateriaStatus,
    para: MateriaStatus,
): boolean {
    if (de === para) return true;
    return (STATUS_TRAMITAR_GRAPH[de] ?? []).includes(para);
}

export type TipoAutorMateria = 'PARLAMENTAR' | 'TENANT_PARTNER' | 'COMISSAO';

export interface AutorSelecionado {
    tipo: TipoAutorMateria;
    /** ID do Parliamentarian (API: authorParliamentarianId / coautorIds). */
    parlamentarianId?: string;
    parlamentarianUserId?: string;
    parlamentarianUserNome?: string;
    /** ID do TenantPartner (API: tenantPartnerId). */
    tenantPartnerId?: string;
    tenantPartnerUserId?: string;
    tenantPartnerUserNome?: string;
    tenantPartnerNome?: string;
    comissaoId?: string;
    comissaoNome?: string;
}

export interface TipoMateria {
    id: string;
    nome: string;
    sigla?: string;
}

export interface TramitacaoItem {
    id: string;
    status: MateriaStatus;
    observacao?: string;
    criadoEm: string;
}

export interface MateriaDetalhe {
    id: string;
    numero: string | number | null;
    ano: number | { valor: number } | null;
    sigla?: string;
    tipoMateria?: TipoMateria;
    tipo?: TipoMateria;
    ementa: string;
    justificativa?: string;
    statusMateria: MateriaStatus;
    dataProtocolo?: string | null;
    autor?: AutorSelecionado | null;
    coautores?: CoautorMateria[];
    tramitacao?: TramitacaoItem[];
}

export interface CoautorMateria {
    id: string;
    ordem: number;
    tipoCoautor?: 'PARLAMENTAR' | 'TENANT_PARTNER';
    /** Resposta atual da API (parliamentarian). */
    parliamentarian?: {
        id: string;
        parliamentaryName: string;
        photoUrl?: string | null;
    };
    /** Legado — CoautorSection. */
    parlamentar?: {
        nomeParlamentar?: string;
    };
    tenantPartnerUser?: {
        nome?: string;
        tenantPartner?: { nome?: string };
    };
}

export interface CoautorFormItem {
    localId: string;
    tipo: '' | TipoAutorMateria;
    selecionado: AutorSelecionado | null;
}

export interface CreateCoautorDto {
    tipoAutor: TipoAutorMateria;
    parlamentarianId?: string;
    tenantPartnerId?: string;
    comissaoId?: string;
}

export interface CreateMateriaDto {
    tipoMateriaId: string;
    numero?: string;
    dataProtocolo?: string;
    ementa: string;
    justificativa?: string;
    statusMateria?: MateriaStatus;
    tipoAutor?: TipoAutorMateria;
    parlamentarianId?: string;
    tenantPartnerId?: string;
    comissaoId?: string;
    coautores?: CreateCoautorDto[];
}

export interface UpdateMateriaDto {
    ementa?: string;
    justificativa?: string;
    dataProtocolo?: string;
    statusMateria?: MateriaStatus;
}

export const TIPOS_AUTOR_OPTIONS: Array<{ value: TipoAutorMateria; label: string }> = [
    { value: 'PARLAMENTAR', label: 'Parlamentar' },
    { value: 'TENANT_PARTNER', label: 'Instituição parceira' },
    { value: 'COMISSAO', label: 'Comissão' },
];
