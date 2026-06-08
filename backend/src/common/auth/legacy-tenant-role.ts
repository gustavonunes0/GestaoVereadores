/**
 * Papéis legados usados por @TenantRoles nos módulos legislativos (Fase 1).
 * Mapeados para flags de TenantUser: isTenantAdmin, isTenantStaff, isParliamentarian.
 */
export enum LegacyTenantRole {
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    MEMBER = 'MEMBER',
    VIEWER = 'VIEWER',
}

export function matchesLegacyTenantRole(
    role: LegacyTenantRole,
    flags: {
        isTenantAdmin?: boolean;
        isTenantStaff?: boolean;
        isParliamentarian?: boolean;
    },
): boolean {
    switch (role) {
        case LegacyTenantRole.OWNER:
        case LegacyTenantRole.ADMIN:
            return flags.isTenantAdmin === true;
        case LegacyTenantRole.MANAGER:
            return flags.isTenantStaff === true || flags.isTenantAdmin === true;
        case LegacyTenantRole.MEMBER:
            return (
                flags.isTenantStaff === true ||
                flags.isTenantAdmin === true ||
                flags.isParliamentarian === true
            );
        case LegacyTenantRole.VIEWER:
            return true;
        default:
            return false;
    }
}
