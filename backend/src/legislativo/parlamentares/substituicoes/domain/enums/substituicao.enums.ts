export enum MotivoSubstituicao {
    LICENCA = 'LICENCA',
    AFASTAMENTO = 'AFASTAMENTO',
    CARGO_EXECUTIVO = 'CARGO_EXECUTIVO',
    OUTRO = 'OUTRO',
}

export const MOTIVO_SUBSTITUICAO_LABELS: Record<MotivoSubstituicao, string> = {
    [MotivoSubstituicao.LICENCA]: 'Licença',
    [MotivoSubstituicao.AFASTAMENTO]: 'Afastamento',
    [MotivoSubstituicao.CARGO_EXECUTIVO]: 'Cargo no Executivo',
    [MotivoSubstituicao.OUTRO]: 'Outro',
};

export enum StatusSubstituicao {
    ATIVA = 'ATIVA',
    ENCERRADA = 'ENCERRADA',
    CANCELADA = 'CANCELADA',
}

export enum AcaoSubstituicaoHistorico {
    CRIADA = 'CRIADA',
    DATAS_ALTERADAS = 'DATAS_ALTERADAS',
    ENCERRADA = 'ENCERRADA',
    CANCELADA = 'CANCELADA',
}
