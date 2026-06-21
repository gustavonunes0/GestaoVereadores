import type { FasePauta, TipoPautaItem } from '../../../types/sessoes';

const FASE_ABREV: Record<FasePauta, string> = {
    PEQUENO_EXPEDIENTE:   'P.EXP',
    GRANDE_EXPEDIENTE:    'G.EXP',
    ORDEM_DO_DIA:         'O.D.',
    EXPLICACOES_PESSOAIS: 'EXP.P.',
};

const TIPO_ABREV: Record<TipoPautaItem, string> = {
    LEITURA:     'LEI',
    DELIBERACAO: 'DEL',
    COMUNICACAO: 'COM',
};

export function FasePautaBadge({ fase }: { fase: FasePauta }) {
    const classe = fase === 'ORDEM_DO_DIA' ? 'badge--warning' : 'badge--neutral';
    return (
        <span className={`badge ${classe}`}>
            {FASE_ABREV[fase] ?? fase}
        </span>
    );
}

export function TipoPautaBadge({ tipo }: { tipo: TipoPautaItem }) {
    const classe = tipo === 'DELIBERACAO' ? 'badge--info' : 'badge--neutral';
    return (
        <span className={`badge ${classe}`}>
            {TIPO_ABREV[tipo] ?? tipo}
        </span>
    );
}
