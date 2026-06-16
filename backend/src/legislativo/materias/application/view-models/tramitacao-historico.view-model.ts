import { TramitacaoHistorico } from '../../domain/entities/tramitacao-historico.entity';
import { MATTER_STATUS_LABELS } from '../../domain/enums/matter-status.enum';

export class TramitacaoHistoricoViewModel {
    static toHttp(h: TramitacaoHistorico) {
        return {
            id: h.id,
            dataHora: h.dataHora,
            statusAnterior: h.statusAnterior
                ? {
                      value: h.statusAnterior,
                      label: MATTER_STATUS_LABELS[h.statusAnterior],
                  }
                : null,
            statusNovo: {
                value: h.statusNovo,
                label: MATTER_STATUS_LABELS[h.statusNovo],
            },
            despacho: h.despacho,
            observacao: h.observacao,
            responsavelId: h.responsavelId,
        };
    }
}
