import { SessaoHistoricoEntity } from '../entities/sessao-historico.entity';
import { TipoEventoSessaoHistorico } from '../enums/tipo-evento-sessao-historico.enum';

export type RegistrarHistoricoDados = {
    sessaoId: string;
    tipoEvento: TipoEventoSessaoHistorico;
    responsavelId?: string | null;
    descricao?: string;
    metadata?: Record<string, unknown>;
};

export type ListSessaoHistoricoParams = {
    tipoEvento?: TipoEventoSessaoHistorico;
    page?: number;
    limit?: number;
};

/**
 * `registrar` nunca lança — é um log de auditoria de melhor esforço, não a fonte de
 * verdade do estado da sessão (essa continua sendo os campos de `SessaoPlenaria`/`Votacao`/etc).
 * Uma falha aqui não pode derrubar a operação de negócio que a originou.
 */
export abstract class SessaoHistoricoRepository {
    abstract registrar(dados: RegistrarHistoricoDados): Promise<void>;
    abstract findMany(
        sessaoId: string,
        tenantId: string,
        params: ListSessaoHistoricoParams,
    ): Promise<{ data: SessaoHistoricoEntity[]; total: number }>;
}
