export enum PapelAutorMateria {
    COAUTOR = 'COAUTOR',
    RELATOR = 'RELATOR',
    REPRESENTANTE = 'REPRESENTANTE',
}

export const PAPEL_AUTOR_MATERIA_LABELS: Record<PapelAutorMateria, string> = {
    [PapelAutorMateria.COAUTOR]: 'Coautor',
    [PapelAutorMateria.RELATOR]: 'Relator',
    [PapelAutorMateria.REPRESENTANTE]: 'Representante',
};
