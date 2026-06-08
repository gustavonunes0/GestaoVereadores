export enum MatterAuthorType {
    PARLIAMENTARIAN = 'PARLIAMENTARIAN',
    EXTERNAL = 'EXTERNAL',
}

export const MATTER_AUTHOR_TYPE_LABELS: Record<MatterAuthorType, string> = {
    [MatterAuthorType.PARLIAMENTARIAN]: 'Parlamentar',
    [MatterAuthorType.EXTERNAL]: 'Autor externo',
};
