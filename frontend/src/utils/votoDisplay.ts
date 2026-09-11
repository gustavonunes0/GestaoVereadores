export type VotoCampo =
    | string
    | { value: string; label?: string }
    | null
    | undefined;

const VOTO_LABELS: Record<string, string> = {
    SIM: 'Sim',
    NAO: 'Não',
    ABSTENCAO: 'Abstenção',
};

export function resolveVotoValue(voto: VotoCampo): string | null {
    if (voto == null) return null;
    if (typeof voto === 'string') return voto;
    if (typeof voto === 'object' && typeof voto.value === 'string') {
        return voto.value;
    }
    return null;
}

export function resolveVotoLabel(voto: VotoCampo): string {
    if (voto != null && typeof voto === 'object' && typeof voto.label === 'string') {
        return voto.label;
    }
    const value = resolveVotoValue(voto);
    if (!value) return '—';
    return VOTO_LABELS[value] ?? value;
}

/** Paleta oficial: Sim=azul, Não=vermelho, Abstenção=cinza */
export const VOTO_COR_CLASS: Record<string, string> = {
    SIM: 'voto-cor--sim',
    NAO: 'voto-cor--nao',
    ABSTENCAO: 'voto-cor--abstencao',
};

export function resolveVotoCorClass(voto: VotoCampo): string {
    const value = resolveVotoValue(voto);
    if (!value) return '';
    return VOTO_COR_CLASS[value] ?? '';
}

/** Ex.: 6 → "6º ano legislativo" */
export function formatAnoLegislativo(numero: number | null | undefined): string | null {
    if (numero == null || !Number.isFinite(numero)) return null;
    return `${numero}º ano legislativo`;
}
