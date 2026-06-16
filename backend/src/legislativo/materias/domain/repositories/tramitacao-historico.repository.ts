import { TramitacaoHistorico } from '../entities/tramitacao-historico.entity';

export abstract class TramitacaoHistoricoRepository {
    abstract findByMateriaId(
        materiaId: string,
        tenantId: string,
    ): Promise<TramitacaoHistorico[]>;
}
