import { RoleUsuario, TenantUserRole } from '@prisma/client';

export type AuthType = 'sigl' | 'camara';

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

export type CamaraAuthenticatedUser = StaffAuthenticatedUser | ParlamentarianAuthenticatedUser;

export type SiglAuthenticatedUser = {
    id: string;
    authType: 'sigl';
    tenantId?: string;
    username?: string;
    nome?: string;
    role?: RoleUsuario;
};

export type AuthenticatedUser = CamaraAuthenticatedUser | SiglAuthenticatedUser;

export function isStaffUser(u: AuthenticatedUser): u is StaffAuthenticatedUser {
    return u.authType === 'camara' && (u as CamaraAuthenticatedUser).sessionType === 'staff';
}

export function isParlamentarianUser(u: AuthenticatedUser): u is ParlamentarianAuthenticatedUser {
    return u.authType === 'camara' && (u as CamaraAuthenticatedUser).sessionType === 'parliamentarian';
}

export type RequestWithTenant = {
    tenantId?: string;
    user?: AuthenticatedUser;
};
