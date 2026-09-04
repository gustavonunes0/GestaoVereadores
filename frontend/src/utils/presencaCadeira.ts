import type { PresencaParlamentar, SituacaoPresencaValor } from '../types/presenca';

export const CORES_CADEIRA: Record<
    SituacaoPresencaValor,
    { fill: string; stroke: string; text: string }
> = {
    PRESENTE: {
        fill: 'var(--presenca-seat-presente)',
        stroke: 'var(--presenca-seat-presente-stroke)',
        text: '#ffffff',
    },
    AUSENTE: {
        fill: 'var(--presenca-seat-ausente)',
        stroke: 'var(--presenca-seat-ausente-stroke)',
        text: '#ffffff',
    },
    JUSTIFICADO: {
        fill: 'var(--presenca-seat-justificado)',
        stroke: 'var(--presenca-seat-justificado-stroke)',
        text: '#ffffff',
    },
    PENDENTE: {
        fill: 'var(--presenca-seat-pendente)',
        stroke: 'var(--presenca-seat-pendente-stroke)',
        text: '#ffffff',
    },
};

export const LABELS_SITUACAO: Record<SituacaoPresencaValor, string> = {
    PRESENTE: 'Presente',
    AUSENTE: 'Faltoso',
    JUSTIFICADO: 'Justificado',
    PENDENTE: 'Pendente',
};

export function resolveSituacaoCadeira(p: PresencaParlamentar): SituacaoPresencaValor {
    // Update otimista (ainda sem id): respeita presente/situacao já aplicados no clique
    if (!p.presencaId) {
        if (p.situacao === 'JUSTIFICADO') return 'JUSTIFICADO';
        if (p.presente || p.situacao === 'PRESENTE') return 'PRESENTE';
        if (p.situacao === 'AUSENTE') return 'AUSENTE';
        return 'PENDENTE';
    }
    if (p.situacao === 'JUSTIFICADO') return 'JUSTIFICADO';
    if (p.presente) return 'PRESENTE';
    if (p.situacao === 'AUSENTE' || p.situacao === 'PRESENTE' || p.situacao == null) {
        return 'AUSENTE';
    }
    return 'PENDENTE';
}

/** Variante visual — sem registro = azul institucional (como no design). */
export type VarianteCadeiraVisual =
    | 'institucional'
    | 'presente'
    | 'ausente'
    | 'justificado'
    | 'pendente';

export function resolveVarianteVisual(p: PresencaParlamentar): VarianteCadeiraVisual {
    if (!p.presencaId && !p.presente && p.situacao !== 'PRESENTE' && p.situacao !== 'AUSENTE') {
        return 'institucional';
    }
    const situacao = resolveSituacaoCadeira(p);
    if (situacao === 'PENDENTE') return 'pendente';
    return situacao.toLowerCase() as VarianteCadeiraVisual;
}
