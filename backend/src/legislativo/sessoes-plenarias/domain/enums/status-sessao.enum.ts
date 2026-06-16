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
