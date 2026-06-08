/** Alinhado ao enum Prisma `CodigoSituacaoSessao`. */
export enum SessionStatus {
    AGENDADA = 'AGENDADA',
    EM_ANDAMENTO = 'EM_ANDAMENTO',
    ENCERRADA = 'ENCERRADA',
    CANCELADA = 'CANCELADA',
}

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
    [SessionStatus.AGENDADA]: 'Agendada',
    [SessionStatus.EM_ANDAMENTO]: 'Em andamento',
    [SessionStatus.ENCERRADA]: 'Encerrada',
    [SessionStatus.CANCELADA]: 'Cancelada',
};
