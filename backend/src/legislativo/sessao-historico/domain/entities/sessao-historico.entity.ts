import { TipoEventoSessaoHistorico } from '../enums/tipo-evento-sessao-historico.enum';

export class SessaoHistoricoEntity {
    id: string;
    sessaoId: string;
    tipoEvento: TipoEventoSessaoHistorico;
    dataHora: Date;
    responsavelId?: string | null;
    responsavelNome?: string | null;
    descricao?: string | null;
    metadata?: Record<string, unknown> | null;
}
