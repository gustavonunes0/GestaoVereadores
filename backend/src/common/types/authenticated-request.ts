import { TenantUserRole } from '@prisma/client';

export type AuthType = 'camara' | 'platform';

export type StaffAuthenticatedUser = {
    id: string;
    authType: 'camara';
    sessionType: 'staff';
    tenantId: string;
    tenantUserId: string;
    role: TenantUserRole;
    email?: string;
    nome?: string;
};

export type ParlamentarianAuthenticatedUser = {
    id: string;
    authType: 'camara';
    sessionType: 'parliamentarian';
    tenantId: string;
    parliamentarianUserId: string;
    parliamentarianId: string;
    parliamentaryName: string;
    email?: string;
    nome?: string;
};

export type PlatformAuthenticatedUser = {
    id: string;
    authType: 'platform';
    sessionType: 'platform';
    email?: string;
    nome?: string;
};

export type CamaraAuthenticatedUser = StaffAuthenticatedUser | ParlamentarianAuthenticatedUser;

export type AuthenticatedUser = CamaraAuthenticatedUser | PlatformAuthenticatedUser;

export function isStaffUser(u: AuthenticatedUser): u is StaffAuthenticatedUser {
    return u.authType === 'camara' && u.sessionType === 'staff';
}

export function isParlamentarianUser(u: AuthenticatedUser): u is ParlamentarianAuthenticatedUser {
    return u.authType === 'camara' && u.sessionType === 'parliamentarian';
}

export function isPlatformUser(u: AuthenticatedUser): u is PlatformAuthenticatedUser {
    return u.authType === 'platform' && u.sessionType === 'platform';
}

/** ID de TenantUser para FKs (ex.: responsavelAberturaId). Não usar User.id. */
export function resolveTenantUserId(user?: AuthenticatedUser): string | undefined {
    if (user && isStaffUser(user)) return user.tenantUserId;
    return undefined;
}

export type RequestWithTenant = {
    tenantId?: string;
    user?: AuthenticatedUser;
};
