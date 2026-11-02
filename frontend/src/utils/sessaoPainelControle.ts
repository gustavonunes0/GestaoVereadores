import type { StatusSessao } from '../types/sessoes';

/** Telão / item do painel: disponível antes de abrir a sessão. */
export function podeControlarPainelSessao(
    canManageSessao: boolean,
    statusSessao: StatusSessao,
): boolean {
    if (!canManageSessao) return false;
    return statusSessao !== 'ENCERRADA' && statusSessao !== 'CANCELADA';
}

/** Votação (abrir/fechar) exige sessão aberta. */
export function podeDeliberarSessao(
    canManageSessao: boolean,
    statusSessao: StatusSessao,
): boolean {
    return canManageSessao && statusSessao === 'ABERTA';
}
