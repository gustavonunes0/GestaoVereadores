export type TenantMaintainerFlags = {
    isTenantAdmin?: boolean;
    isTenantStaff?: boolean;
};

/**
 * Usuário responsável por manter o sistema da Câmara:
 * TenantUser com isTenantAdmin ou isTenantStaff.
 */
export function isTenantMaintainer(flags: TenantMaintainerFlags): boolean {
    return flags.isTenantAdmin === true || flags.isTenantStaff === true;
}
