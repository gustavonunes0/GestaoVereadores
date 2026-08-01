export type StatusAta = 'RASCUNHO' | 'APROVADA' | 'PUBLICADA';

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
