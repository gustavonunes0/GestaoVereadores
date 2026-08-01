import { SessaoHistoricoEntity } from '../../domain/entities/sessao-historico.entity';
import { TIPO_EVENTO_SESSAO_HISTORICO_LABELS } from '../../domain/enums/tipo-evento-sessao-historico.enum';

export class SessaoHistoricoViewModel {
    static toHttp(item: SessaoHistoricoEntity) {
        return {
            id: item.id,
            tipoEvento: {
                value: item.tipoEvento,
                label: TIPO_EVENTO_SESSAO_HISTORICO_LABELS[item.tipoEvento],
            },
            dataHora: item.dataHora.toISOString(),
            responsavel: item.responsavelId
                ? { id: item.responsavelId, nome: item.responsavelNome ?? null }
                : null,
            descricao: item.descricao ?? null,
            metadata: item.metadata ?? null,
        };
    }
}
