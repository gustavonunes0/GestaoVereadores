import { CondicaoMandato } from '../../../mandatos/domain/enums/condicao-mandato.enum';
import {
    AcaoSubstituicaoHistorico,
    MotivoSubstituicao,
    StatusSubstituicao,
} from '../enums/substituicao.enums';
import { DataCivil } from '../services/exercicio-mandato';

export type ParlamentarResumo = { id: string; parliamentaryName: string };
export type ResponsavelResumo = { id: string; nome: string };

export type SubstituicaoRecord = {
    id: string;
    tenantId: string;
    legislatureId: string;
    titularId: string;
    suplenteId: string;
    motivo: MotivoSubstituicao;
    dataInicio: DataCivil;
    dataFim: DataCivil | null;
    observacao: string | null;
    status: StatusSubstituicao;
    encerradaEm: Date | null;
    createdAt: Date;
    updatedAt: Date;
    titular: ParlamentarResumo;
    suplente: ParlamentarResumo;
    criadoPor: ResponsavelResumo | null;
    encerradoPor: ResponsavelResumo | null;
};

export type SubstituicaoHistoricoRecord = {
    id: string;
    acao: AcaoSubstituicaoHistorico;
    dataHora: Date;
    responsavel: ResponsavelResumo | null;
    alteracoes: unknown;
};

export type MandatoAtivoResumo = {
    legislatureId: string;
    condicao: CondicaoMandato;
    partyAcronym: string | null;
};

export type SuplenteElegivel = ParlamentarResumo & { partyAcronym: string | null };

export type CriarSubstituicaoDados = {
    tenantId: string;
    legislatureId: string;
    titularId: string;
    suplenteId: string;
    motivo: MotivoSubstituicao;
    dataInicio: DataCivil;
    dataFim: DataCivil | null;
    observacao: string | null;
};

export type AtualizarSubstituicaoDados = Partial<{
    dataInicio: DataCivil;
    dataFim: DataCivil | null;
    observacao: string | null;
    status: StatusSubstituicao;
    encerradaEm: Date;
    encerradoPorId: string | null;
}>;

export type RegistroHistorico = {
    acao: AcaoSubstituicaoHistorico;
    responsavelId: string | null;
    alteracoes?: Record<string, unknown>;
};

export abstract class SubstituicaoRepository {
    abstract findById(tenantId: string, id: string): Promise<SubstituicaoRecord | null>;

    /** Substituições em que o parlamentar é titular ou suplente, mais recentes primeiro. */
    abstract listByParlamentar(
        tenantId: string,
        parliamentarianId: string,
    ): Promise<SubstituicaoRecord[]>;

    /** Não canceladas que envolvem o titular ou o suplente (para checar sobreposição). */
    abstract listNaoCanceladasEnvolvendo(
        tenantId: string,
        titularId: string,
        suplenteId: string,
        excetoId?: string,
    ): Promise<SubstituicaoRecord[]>;

    abstract findMandatoAtivo(
        tenantId: string,
        parliamentarianId: string,
        legislatureId?: string,
    ): Promise<MandatoAtivoResumo | null>;

    abstract listSuplentesElegiveis(
        tenantId: string,
        legislatureId: string,
    ): Promise<SuplenteElegivel[]>;

    abstract create(
        dados: CriarSubstituicaoDados,
        historico: RegistroHistorico,
        criadoPorId: string | null,
    ): Promise<SubstituicaoRecord>;

    abstract update(
        tenantId: string,
        id: string,
        dados: AtualizarSubstituicaoDados,
        historico: RegistroHistorico,
    ): Promise<SubstituicaoRecord>;

    abstract listHistorico(
        tenantId: string,
        id: string,
    ): Promise<SubstituicaoHistoricoRecord[]>;
}
