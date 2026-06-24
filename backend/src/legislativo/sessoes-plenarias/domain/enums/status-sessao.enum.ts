/** Alinhado ao enum Prisma `StatusSessao` (Migration M4). */
export enum StatusSessao {
    AGENDADA = 'AGENDADA',
    ABERTA = 'ABERTA',
    SUSPENSA = 'SUSPENSA',
    ENCERRADA = 'ENCERRADA',
    CANCELADA = 'CANCELADA',
}

export const STATUS_SESSAO_LABELS: Record<StatusSessao, string> = {
    [StatusSessao.AGENDADA]: 'Agendada',
    [StatusSessao.ABERTA]: 'Aberta',
    [StatusSessao.SUSPENSA]: 'Suspensa',
    [StatusSessao.ENCERRADA]: 'Encerrada',
    [StatusSessao.CANCELADA]: 'Cancelada',
};

/** Mapeia `StatusSessao` (novo) → `CodigoSituacaoSessao` (legado). */
export function statusSessaoToCodigoSituacao(
    status: StatusSessao,
): 'AGENDADA' | 'EM_ANDAMENTO' | 'ENCERRADA' | 'CANCELADA' {
    switch (status) {
        case StatusSessao.AGENDADA:
            return 'AGENDADA';
        case StatusSessao.ABERTA:
        case StatusSessao.SUSPENSA:
            return 'EM_ANDAMENTO';
        case StatusSessao.ENCERRADA:
            return 'ENCERRADA';
        case StatusSessao.CANCELADA:
            return 'CANCELADA';
    }
}
