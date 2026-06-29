import type { FasePauta, TipoPautaItem } from '../types/sessoes';

const SIGLAS_PE = ['OFC', 'IND', 'REQ'];

export function inferirFase(sigla: string): FasePauta {
    return SIGLAS_PE.includes(sigla.toUpperCase()) ? 'PEQUENO_EXPEDIENTE' : 'ORDEM_DO_DIA';
}

export function inferirTipo(fase: FasePauta): TipoPautaItem {
    return fase === 'ORDEM_DO_DIA' ? 'DELIBERACAO' : 'COMUNICACAO';
}
