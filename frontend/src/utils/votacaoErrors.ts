import { ApiError } from '../api/client';

/** Resposta 400 quando encerrar/finalizar é chamado após a votação já ter sido fechada. */
export function isVotacaoJaEncerradaError(error: unknown): boolean {
    if (!(error instanceof ApiError) || error.status !== 400) return false;
    const msg = error.message.toLowerCase();
    return (
        msg.includes('já foi encerrada') ||
        msg.includes('já foi finalizada') ||
        msg.includes('possui resultado calculado')
    );
}
