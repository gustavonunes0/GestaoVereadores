/** Alinhado ao enum Prisma `CodigoTipoSessao`. */
export enum SessionType {
    ORDINARIA = 'ORDINARIA',
    EXTRAORDINARIA = 'EXTRAORDINARIA',
    SOLENE = 'SOLENE',
    ESPECIAL = 'ESPECIAL',
}

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
    [SessionType.ORDINARIA]: 'Ordinária',
    [SessionType.EXTRAORDINARIA]: 'Extraordinária',
    [SessionType.SOLENE]: 'Solene',
    [SessionType.ESPECIAL]: 'Especial',
};
