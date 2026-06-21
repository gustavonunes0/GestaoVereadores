export enum TipoPautaItem {
    LEITURA = 'LEITURA',
    DELIBERACAO = 'DELIBERACAO',
    COMUNICACAO = 'COMUNICACAO',
}

export const TIPO_PAUTA_ITEM_LABELS: Record<TipoPautaItem, string> = {
    [TipoPautaItem.LEITURA]: 'Leitura',
    [TipoPautaItem.DELIBERACAO]: 'Deliberação',
    [TipoPautaItem.COMUNICACAO]: 'Comunicação',
};

export const SIGLAS_LEITURA = ['OFC', 'IND', 'REQ'] as const;
