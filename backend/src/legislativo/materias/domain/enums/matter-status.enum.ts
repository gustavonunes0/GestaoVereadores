/** Alinhado ao enum Prisma `StatusMateria`. */
export enum MatterStatus {
    DRAFT = 'DRAFT',
    PROTOCOLADA = 'PROTOCOLADA',
    EM_TRAMITACAO = 'EM_TRAMITACAO',
    EM_PAUTA = 'EM_PAUTA',
    APROVADA = 'APROVADA',
    REJEITADA = 'REJEITADA',
    ARQUIVADA = 'ARQUIVADA',
    RETIRADA = 'RETIRADA',
    TRANSFORMADA_EM_NORMA = 'TRANSFORMADA_EM_NORMA',
}

export const MATTER_STATUS_LABELS: Record<MatterStatus, string> = {
    [MatterStatus.DRAFT]: 'Rascunho',
    [MatterStatus.PROTOCOLADA]: 'Protocolada',
    [MatterStatus.EM_TRAMITACAO]: 'Em tramitação',
    [MatterStatus.EM_PAUTA]: 'Em pauta',
    [MatterStatus.APROVADA]: 'Aprovada',
    [MatterStatus.REJEITADA]: 'Rejeitada',
    [MatterStatus.ARQUIVADA]: 'Arquivada',
    [MatterStatus.RETIRADA]: 'Retirada',
    [MatterStatus.TRANSFORMADA_EM_NORMA]: 'Transformada em norma',
};
