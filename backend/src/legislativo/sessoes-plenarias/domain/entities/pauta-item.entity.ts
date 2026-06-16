import { StatusPautaItem } from '../enums/status-pauta-item.enum';

export class PautaItemEntity {
    id: string;
    sessaoId: string;
    materiaId: string;
    ordem: number;
    fase: string;
    resultado: string | null;
    statusPauta: StatusPautaItem;
    publicadaEm: Date | null;
    ordemDia: number | null;
    isRemoved: boolean;
    createdAt: Date;
    updatedAt: Date;

    estaPublicada(): boolean {
        return this.statusPauta === StatusPautaItem.PUBLICADA || this.publicadaEm !== null;
    }

    podeSerRemovido(): boolean {
        return this.statusPauta === StatusPautaItem.RASCUNHO;
    }
}
