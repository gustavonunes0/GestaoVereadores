/** Alinhado ao enum Prisma `TipoVotacao`. */
export enum VoteType {
    NOMINAL = 'NOMINAL',
    SIMBOLICA = 'SIMBOLICA',
    SECRETA = 'SECRETA',
}

export const VOTE_TYPE_LABELS: Record<VoteType, string> = {
    [VoteType.NOMINAL]: 'Nominal',
    [VoteType.SIMBOLICA]: 'Simbólica',
    [VoteType.SECRETA]: 'Secreta',
};
