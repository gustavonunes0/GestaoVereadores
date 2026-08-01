export enum StatusAta {
    RASCUNHO = 'RASCUNHO',
    APROVADA = 'APROVADA',
    PUBLICADA = 'PUBLICADA',
}

export const STATUS_ATA_LABELS: Record<StatusAta, string> = {
    [StatusAta.RASCUNHO]: 'Rascunho',
    [StatusAta.APROVADA]: 'Aprovada',
    [StatusAta.PUBLICADA]: 'Publicada',
};
