export enum FaseSessao {
    NAO_INICIADA = 'NAO_INICIADA',
    EXPEDIENTE = 'EXPEDIENTE',
    ORDEM_DO_DIA = 'ORDEM_DO_DIA',
    EXPLICACOES_PESSOAIS = 'EXPLICACOES_PESSOAIS',
    ENCERRADA = 'ENCERRADA',
}

export const FASE_SESSAO_LABELS: Record<FaseSessao, string> = {
    [FaseSessao.NAO_INICIADA]: 'Não iniciada',
    [FaseSessao.EXPEDIENTE]: 'Expediente',
    [FaseSessao.ORDEM_DO_DIA]: 'Ordem do Dia',
    [FaseSessao.EXPLICACOES_PESSOAIS]: 'Explicações Pessoais',
    [FaseSessao.ENCERRADA]: 'Encerrada',
};
