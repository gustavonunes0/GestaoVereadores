/** Alinhado ao enum Prisma `FasePauta`. */
export enum AgendaPhase {
    PEQUENO_EXPEDIENTE = 'PEQUENO_EXPEDIENTE',
    GRANDE_EXPEDIENTE = 'GRANDE_EXPEDIENTE',
    ORDEM_DO_DIA = 'ORDEM_DO_DIA',
    EXPLICACOES_PESSOAIS = 'EXPLICACOES_PESSOAIS',
}

export const AGENDA_PHASE_LABELS: Record<AgendaPhase, string> = {
    [AgendaPhase.PEQUENO_EXPEDIENTE]: 'Pequeno expediente',
    [AgendaPhase.GRANDE_EXPEDIENTE]: 'Grande expediente',
    [AgendaPhase.ORDEM_DO_DIA]: 'Ordem do dia',
    [AgendaPhase.EXPLICACOES_PESSOAIS]: 'Explicações pessoais',
};
