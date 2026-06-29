import { StatusPautaItem } from '../enums/status-pauta-item.enum';

export class PautaEntity {
    id: string;
    tenantId: string;
    sessaoId: string;
    status: StatusPautaItem;
    publicadaEm: Date | null;
    isRemoved: boolean;
    createdAt: Date;
    updatedAt: Date;

    estaAtiva(): boolean {
        return !this.isRemoved;
    }

    estaPublicada(): boolean {
        return this.status === StatusPautaItem.PUBLICADA;
    }

    podeSerPublicada(): boolean {
        return this.status === StatusPautaItem.RASCUNHO;
    }

    podeReceberItens(): boolean {
        return (
            this.status === StatusPautaItem.RASCUNHO ||
            this.status === StatusPautaItem.PUBLICADA
        );
    }
}
