import { TenantUserRole } from '@prisma/client';

export const STAFF_AND_ABOVE: TenantUserRole[] = [
    TenantUserRole.ADMIN_STAFF,
    TenantUserRole.STAFF,
];

export const ADMIN_ONLY: TenantUserRole[] = [TenantUserRole.ADMIN_STAFF];

export const ALL_AUTHENTICATED: TenantUserRole[] = [
    TenantUserRole.ADMIN_STAFF,
    TenantUserRole.STAFF,
    TenantUserRole.PARLIAMENTARIAN,
];

export const PARLIAMENTARIAN_ONLY: TenantUserRole[] = [
    TenantUserRole.PARLIAMENTARIAN,
];
