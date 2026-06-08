/** Alinhado ao enum Prisma `Voto`. */
export enum VoteValue {
    SIM = 'SIM',
    NAO = 'NAO',
    ABSTENCAO = 'ABSTENCAO',
    PRESENTE = 'PRESENTE',
}

export const VOTE_VALUE_LABELS: Record<VoteValue, string> = {
    [VoteValue.SIM]: 'Sim',
    [VoteValue.NAO]: 'Não',
    [VoteValue.ABSTENCAO]: 'Abstenção',
    [VoteValue.PRESENTE]: 'Presente',
};
