import type { Materia } from '../api/legislative/materias.api';
import { formatProtocoloNumero, resolveMateriaAno } from './materiaDisplay';

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

/** Título do card: tipo + número legislativo ou protocolo. */
export function resolveMateriaCardTitulo(materia: Materia): string {
    const tipoNome = resolveMateriaTipoNome(materia.tipo);
    const ano = resolveMateriaAno(materia);

    if (materia.numero != null && materia.numero !== '') {
        return `${tipoNome} nº ${materia.numero}/${ano ?? '?'}`;
    }

    const protocolo = formatProtocoloNumero(materia.numeroProtocolo);
    if (protocolo) {
        return ano != null
            ? `${tipoNome} Prot. ${protocolo}/${ano}`
            : `${tipoNome} Prot. ${protocolo}`;
    }

    return tipoNome;
}
