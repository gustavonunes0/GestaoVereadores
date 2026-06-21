import type { Materia } from '../api/legislative/materias.api';
import { formatarIdentificacao } from './materiaIdentificacao';

const STRIPE_COLORS: Record<string, string> = {
    PLO: '#2563a8',
    ELOM: '#7c3aed',
    REQ: '#0d9488',
    IND: '#ea580c',
    MOC: '#db2777',
    PLP: '#4f46e5',
    PDL: '#0891b2',
};

export function getMateriaStripeColor(tipoSigla?: string | null): string {
    const key = tipoSigla?.trim().toUpperCase();
    if (!key) return '#8492a6';
    return STRIPE_COLORS[key] ?? '#8492a6';
}

export function resolveMateriaTipoSigla(
    sigla?: string | null,
    tipo?: { sigla?: string | null; nome?: string } | null,
): string {
    return (sigla ?? tipo?.sigla ?? '').trim().toUpperCase() || 'MAT';
}

export function resolveMateriaTipoNome(
    tipo?: { nome?: string } | null,
): string {
    return tipo?.nome?.trim() || 'Matéria';
}

/** Título do card: "SIGLA numero/ano" ou fallback para tipo nome. */
export function resolveMateriaCardTitulo(materia: Materia): string {
    const id = formatarIdentificacao({
        tipo: materia.tipo,
        numero: materia.numero,
        ano: materia.ano,
    });
    return id || resolveMateriaTipoNome(materia.tipo);
}
