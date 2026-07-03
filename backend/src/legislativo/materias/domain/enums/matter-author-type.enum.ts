export enum MatterAuthorType {
    PARLIAMENTARIAN = 'parliamentarian',
    /** Instituição parceira com usuário vinculado (TenantPartnerUser). */
    TENANT_PARTNER = 'tenant_partner',
}

export const MATTER_AUTHOR_TYPE_LABELS: Record<MatterAuthorType, string> = {
    [MatterAuthorType.PARLIAMENTARIAN]: 'Parlamentar',
    [MatterAuthorType.TENANT_PARTNER]: 'Instituição parceira',
};
