import { TenantUserRole } from '@prisma/client';

/** Sessão de parlamentar para endpoints que aceitam apenas parlamentares logados. */
export const PARLIAMENTARIAN_SESSION = 'PARLIAMENTARIAN_SESSION' as const;

export type TenantRoleRequirement =
    | TenantUserRole
    | typeof PARLIAMENTARIAN_SESSION;

export const STAFF_AND_ABOVE: TenantUserRole[] = [
    TenantUserRole.ADMIN_STAFF,
    TenantUserRole.STAFF,
];

export const ADMIN_ONLY: TenantUserRole[] = [TenantUserRole.ADMIN_STAFF];

export const PARLIAMENTARIAN_ONLY: TenantRoleRequirement[] = [
    PARLIAMENTARIAN_SESSION,
];

export const ALL_AUTHENTICATED: TenantRoleRequirement[] = [
    ...STAFF_AND_ABOVE,
    PARLIAMENTARIAN_SESSION,
];
