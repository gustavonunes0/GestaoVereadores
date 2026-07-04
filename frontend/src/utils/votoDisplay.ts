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
