import { AtaEntity } from '../../domain/entities/ata.entity';
import { STATUS_ATA_LABELS } from '../../domain/enums/status-ata.enum';

export class AtaViewModel {
    static toHttp(ata: AtaEntity) {
        return {
            id: ata.id,
            sessaoId: ata.sessaoPlenariaId,
            status: { value: ata.status, label: STATUS_ATA_LABELS[ata.status] },
            conteudo: ata.conteudo,
            geradaAutomaticamente: ata.geradaAutomaticamente,
            aprovadaEm: ata.aprovadaEm?.toISOString() ?? null,
            aprovadaPorId: ata.aprovadaPorId ?? null,
            pdfUrl: ata.pdfUrl ?? null,
            createdAt: ata.createdAt.toISOString(),
            updatedAt: ata.updatedAt.toISOString(),
        };
    }
}
