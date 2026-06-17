const BOARD_ROLE_ORDER = [
    'presidente',
    'vice-presidente',
    'primeiro secretário',
    'primeiro(a) secretário(a)',
    'segundo secretário',
    'segundo(a) secretário(a)',
];

export function parlamentarInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

export function formatMesaPartyLabel(party?: {
    acronym?: string | null;
    name?: string | null;
} | null): string | null {
    if (!party) return null;
    const acronym = party.acronym?.trim();
    const name = party.name?.trim();
    if (acronym) return acronym.toUpperCase();
    if (!name) return null;
    return name.startsWith('(') ? name : `(${name})`;
}

export function compareBoardRoles(a: string, b: string): number {
    const normalize = (value: string) => value.trim().toLowerCase();
    const indexA = BOARD_ROLE_ORDER.indexOf(normalize(a));
    const indexB = BOARD_ROLE_ORDER.indexOf(normalize(b));
    if (indexA >= 0 && indexB >= 0) return indexA - indexB;
    if (indexA >= 0) return -1;
    if (indexB >= 0) return 1;
    return a.localeCompare(b, 'pt-BR');
}
