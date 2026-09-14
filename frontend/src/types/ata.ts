export type StatusAta = 'RASCUNHO' | 'APROVADA' | 'PUBLICADA';

export const STATUS_ATA_LABELS: Record<StatusAta, string> = {
    RASCUNHO: 'Rascunho',
    APROVADA: 'Aprovada',
    PUBLICADA: 'Publicada',
};

export function resolveStatusAtaLabel(
    status: StatusAta | { value: StatusAta; label: string },
): string {
    if (typeof status === 'object' && status !== null && 'label' in status) {
        return status.label;
    }
    return STATUS_ATA_LABELS[status as StatusAta] ?? String(status);
}

/** Ata de outra sessão, para vincular a um item de pauta do tipo ATA. */
export interface AtaResumo {
    id: string;
    sessaoId: string;
    status: { value: StatusAta; label: string };
    sessao: { dataInicio: string; tipoNome: string | null };
}

export interface Ata {
    id: string;
    sessaoId: string;
    status: { value: StatusAta; label: string };
    conteudo: string;
    geradaAutomaticamente: boolean;
    aprovadaEm: string | null;
    aprovadaPorId: string | null;
    pdfUrl: string | null;
    createdAt: string;
    updatedAt: string;
}
