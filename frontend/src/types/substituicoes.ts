export type MotivoSubstituicao = 'LICENCA' | 'AFASTAMENTO' | 'CARGO_EXECUTIVO' | 'OUTRO';
export type StatusSubstituicao = 'ATIVA' | 'ENCERRADA' | 'CANCELADA';
export type SituacaoSubstituicao = 'AGENDADA' | 'EM_EXERCICIO' | 'FINALIZADA' | 'CANCELADA';
export type AcaoSubstituicaoHistorico = 'CRIADA' | 'DATAS_ALTERADAS' | 'ENCERRADA' | 'CANCELADA';

export const MOTIVO_SUBSTITUICAO_OPTIONS: Array<{ label: string; value: MotivoSubstituicao }> = [
    { label: 'Licença', value: 'LICENCA' },
    { label: 'Afastamento', value: 'AFASTAMENTO' },
    { label: 'Cargo no Executivo', value: 'CARGO_EXECUTIVO' },
    { label: 'Outro', value: 'OUTRO' },
];

type ParlamentarResumo = { id: string; parliamentaryName: string };
type ResponsavelResumo = { id: string; nome: string };

export interface Substituicao {
    id: string;
    legislatureId: string;
    titular: ParlamentarResumo;
    suplente: ParlamentarResumo;
    motivo: { value: MotivoSubstituicao; label: string };
    /** AAAA-MM-DD */
    dataInicio: string;
    /** Último dia de exercício do suplente (AAAA-MM-DD). */
    dataFim: string | null;
    observacao: string | null;
    status: StatusSubstituicao;
    situacao: SituacaoSubstituicao;
    encerradaEm: string | null;
    criadoPor: ResponsavelResumo | null;
    encerradoPor: ResponsavelResumo | null;
    createdAt: string;
    updatedAt: string;
}

export interface SubstituicaoHistorico {
    id: string;
    acao: AcaoSubstituicaoHistorico;
    dataHora: string;
    responsavel: ResponsavelResumo | null;
    alteracoes: Record<string, unknown> | null;
}

export interface SuplenteElegivel {
    id: string;
    parliamentaryName: string;
    partyAcronym: string | null;
    mesmoPartido: boolean;
}

export interface CreateSubstituicaoDto {
    titularId: string;
    suplenteId: string;
    motivo: MotivoSubstituicao;
    dataInicio: string;
    dataFim?: string | null;
    observacao?: string;
}

export interface UpdateSubstituicaoDto {
    dataInicio?: string;
    dataFim?: string | null;
    observacao?: string | null;
}

export interface VagaEmExercicio {
    titular: ParlamentarResumo;
    emExercicio: ParlamentarResumo;
    substituicaoId: string | null;
}

export interface ElencoExercicioSessao {
    sessaoId: string;
    /** Congelado na abertura: mudanças posteriores valem a partir da próxima sessão. */
    congelado: boolean;
    vagas: VagaEmExercicio[];
}
