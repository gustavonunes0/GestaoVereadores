import {
    MOTIVO_SUBSTITUICAO_LABELS,
} from '../../domain/enums/substituicao.enums';
import {
    SubstituicaoHistoricoRecord,
    SubstituicaoRecord,
} from '../../domain/repositories/substituicao.repository';
import { DataCivil, situacaoNaData } from '../../domain/services/exercicio-mandato';

export class SubstituicaoViewModel {
    static toHttp(s: SubstituicaoRecord, hoje: DataCivil) {
        return {
            id: s.id,
            legislatureId: s.legislatureId,
            titular: s.titular,
            suplente: s.suplente,
            motivo: { value: s.motivo, label: MOTIVO_SUBSTITUICAO_LABELS[s.motivo] },
            dataInicio: s.dataInicio,
            dataFim: s.dataFim,
            observacao: s.observacao,
            status: s.status,
            situacao: situacaoNaData(s, hoje),
            encerradaEm: s.encerradaEm,
            criadoPor: s.criadoPor,
            encerradoPor: s.encerradoPor,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
        };
    }

    static historicoToHttp(h: SubstituicaoHistoricoRecord) {
        return {
            id: h.id,
            acao: h.acao,
            dataHora: h.dataHora,
            responsavel: h.responsavel,
            alteracoes: h.alteracoes ?? null,
        };
    }
}
