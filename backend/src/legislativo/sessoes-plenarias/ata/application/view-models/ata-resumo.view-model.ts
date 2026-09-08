import { STATUS_ATA_LABELS } from '../../domain/enums/status-ata.enum';
import { AtaResumo } from '../../domain/repositories/ata.repository';

export class AtaResumoViewModel {
    static toHttp(ata: AtaResumo) {
        return {
            id: ata.id,
            sessaoId: ata.sessaoPlenariaId,
            status: { value: ata.status, label: STATUS_ATA_LABELS[ata.status] },
            sessao: {
                dataInicio: ata.sessaoDataInicio.toISOString(),
                tipoNome: ata.sessaoTipoNome,
            },
        };
    }
}
