import type { FasePauta, PautaItemCategoria, TipoPautaItem } from '../../../types/sessoes';
import { PAUTA_CATEGORIA_LABELS } from '../../../types/sessoes';

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

const CATEGORIA_META: Record<
    PautaItemCategoria,
    { icon: string; className: string }
> = {
    MATERIA: { icon: 'pi pi-file-edit', className: 'pauta-cat--materia' },
    ATO: { icon: 'pi pi-briefcase', className: 'pauta-cat--ato' },
    NORMA: { icon: 'pi pi-book', className: 'pauta-cat--norma' },
    AVISO: { icon: 'pi pi-megaphone', className: 'pauta-cat--aviso' },
    COMISSAO: { icon: 'pi pi-users', className: 'pauta-cat--comissao' },
};

export function CategoriaPautaBadge({
    categoria,
    compacto = false,
}: {
    categoria: PautaItemCategoria;
    compacto?: boolean;
}) {
    const meta = CATEGORIA_META[categoria];
    const label = PAUTA_CATEGORIA_LABELS[categoria];
    return (
        <span
            className={`badge pauta-cat ${meta.className}`}
            title={label}
            aria-label={label}
        >
            <i className={meta.icon} aria-hidden />
            {!compacto && <span>{label}</span>}
        </span>
    );
}

/** Ícone-marcador da categoria (usado como acento à esquerda da linha). */
export function CategoriaPautaIcon({ categoria }: { categoria: PautaItemCategoria }) {
    const meta = CATEGORIA_META[categoria];
    return (
        <span
            className={`pauta-cat-icon ${meta.className}`}
            title={PAUTA_CATEGORIA_LABELS[categoria]}
            aria-hidden
        >
            <i className={meta.icon} />
        </span>
    );
}
