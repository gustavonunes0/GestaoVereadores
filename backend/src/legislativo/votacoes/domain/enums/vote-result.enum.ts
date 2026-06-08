/** Alinhado ao enum Prisma `ResultadoVotacao`. */
export enum VoteResult {
    APROVADO = 'APROVADO',
    REJEITADO = 'REJEITADO',
    EMPATADO = 'EMPATADO',
}

export const VOTE_RESULT_LABELS: Record<VoteResult, string> = {
    [VoteResult.APROVADO]: 'Aprovado',
    [VoteResult.REJEITADO]: 'Rejeitado',
    [VoteResult.EMPATADO]: 'Empatado',
};
