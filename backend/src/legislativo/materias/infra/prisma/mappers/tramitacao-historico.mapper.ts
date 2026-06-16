import { MatterStatus } from '../../../domain/enums/matter-status.enum';
import { TramitacaoHistorico } from '../../../domain/entities/tramitacao-historico.entity';

export type RawTramitacaoHistorico = {
    id: string;
    materiaId: string;
    dataHora: Date;
    statusAnterior: string | null;
    statusNovo: string;
    responsavelId: string | null;
    despacho: string | null;
    observacao: string | null;
    unidadeOrigemId: string | null;
    unidadeDestinoId: string | null;
};

export class TramitacaoHistoricoMapper {
    static toDomain(raw: RawTramitacaoHistorico): TramitacaoHistorico {
        return new TramitacaoHistorico({
            id: raw.id,
            materiaId: raw.materiaId,
            dataHora: raw.dataHora,
            statusAnterior: (raw.statusAnterior as MatterStatus) ?? null,
            statusNovo: raw.statusNovo as MatterStatus,
            responsavelId: raw.responsavelId,
            despacho: raw.despacho,
            observacao: raw.observacao,
            unidadeOrigemId: raw.unidadeOrigemId,
            unidadeDestinoId: raw.unidadeDestinoId,
        });
    }
}
