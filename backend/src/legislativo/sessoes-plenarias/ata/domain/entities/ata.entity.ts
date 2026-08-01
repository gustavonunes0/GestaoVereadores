import { StatusAta } from '../enums/status-ata.enum';

export class AtaEntity {
    id: string;
    tenantId: string;
    sessaoPlenariaId: string;
    status: StatusAta;
    conteudo: string;
    geradaAutomaticamente: boolean;
    aprovadaEm?: Date | null;
    aprovadaPorId?: string | null;
    pdfUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;

    podeSerEditada(): boolean {
        return this.status === StatusAta.RASCUNHO;
    }

    podeSerAprovada(): boolean {
        return this.status === StatusAta.RASCUNHO;
    }
}
