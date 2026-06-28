/** Mirrors backend StatusMateria — UI gates for pauta, norma, etc. */
export const MATERIA_STATUS = {
    DRAFT: 'Rascunho',
    PROTOCOLADA: 'Protocolada',
    EM_TRAMITACAO: 'Em tramitação',
    EM_PAUTA: 'Em pauta',
    EM_VOTACAO: 'Em votação',
    APROVADA: 'Aprovada',
    REJEITADA: 'Rejeitada',
    ARQUIVADA: 'Arquivada',
    RETIRADA: 'Retirada',
    TRANSFORMADA_EM_NORMA: 'Transformada em norma',
} as const;

export type MateriaStatus = keyof typeof MATERIA_STATUS;

export const MATERIA_STATUS_LABELS: Record<MateriaStatus, string> = {
    DRAFT: 'Rascunho',
    PROTOCOLADA: 'Protocolada',
    EM_TRAMITACAO: 'Em tramitação',
    EM_PAUTA: 'Em pauta',
    EM_VOTACAO: 'Em votação',
    APROVADA: 'Aprovada',
    REJEITADA: 'Rejeitada',
    ARQUIVADA: 'Arquivada',
    RETIRADA: 'Retirada',
    TRANSFORMADA_EM_NORMA: 'Transformada em norma',
};

export const SESSAO_STATUS = {
    AGENDADA: 'Agendada',
    ABERTA: 'Aberta',
    SUSPENSA: 'Suspensa',
    ENCERRADA: 'Encerrada',
    CANCELADA: 'Cancelada',
} as const;

export type SessaoStatus = keyof typeof SESSAO_STATUS;

export const NORMA_STATUS = {
    EM_TRAMITE: 'Em trâmite',
    SANCIONADA: 'Sancionada',
    VETADA: 'Vetada',
    PROMULGADA: 'Promulgada',
    PUBLICADA: 'Publicada',
    VIGENTE: 'Vigente',
    REVOGADA: 'Revogada',
} as const;

export type NormaStatus = keyof typeof NORMA_STATUS;

export type TipoVotacao = 'NOMINAL' | 'SIMBOLICA' | 'SECRETA';

/** Evento WebSocket ao abrir votação (tenant + app mobile). */
export interface VotacaoAbertaEvent {
    sessaoId: string;
    votacaoId: string;
    pautaItemId: string;
    tipoVotacao: TipoVotacao;
    titulo: string;
    ementa?: string;
    votosSim: number;
    votosNao: number;
    abstencoes: number;
    aceitaVotoIndividual: boolean;
}

export interface VotacaoPlacarEvent {
    votacaoId: string;
    votosSim: number;
    votosNao: number;
    abstencoes: number;
}

export interface VotacaoEncerradaEvent {
    votacaoId: string;
    resultado: string;
    votosSim: number;
    votosNao: number;
    abstencoes: number;
    votoQualidade?: boolean;
    titulo?: string;
}

export function canAddMateriaToPauta(materia: {
    status?: MateriaStatus;
    emTramitacao?: boolean;
}): boolean {
    if (materia.status) {
        return (
            materia.status === 'EM_TRAMITACAO' ||
            materia.status === 'EM_PAUTA' ||
            materia.status === 'PROTOCOLADA'
        );
    }
    return materia.emTramitacao === true;
}

export function canCreateNormaFromMateria(materia: {
    status?: MateriaStatus;
}): boolean {
    return materia.status === 'APROVADA';
}

export function shouldHideNominalVotes(tipoVotacao?: TipoVotacao): boolean {
    return tipoVotacao === 'SECRETA';
}
