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

import { SessionStatus } from './session-status.enum';

/** Mapeia `SessionStatus` (ciclo de vida legado) → `StatusSessao` (novo). */
export function sessionStatusToStatusSessao(status: SessionStatus): StatusSessao {
    switch (status) {
        case SessionStatus.AGENDADA:
            return StatusSessao.AGENDADA;
        case SessionStatus.EM_ANDAMENTO:
            return StatusSessao.ABERTA;
        case SessionStatus.ENCERRADA:
            return StatusSessao.ENCERRADA;
        case SessionStatus.CANCELADA:
            return StatusSessao.CANCELADA;
    }
}

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
