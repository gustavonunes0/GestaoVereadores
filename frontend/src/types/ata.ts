export type StatusAta = 'RASCUNHO' | 'APROVADA' | 'PUBLICADA';

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
