import { TenantUserRole } from '@prisma/client';

export interface StaffJwtPayload {
    sessionType: 'staff';
    sub: string;
    tenantId: string;
    tenantUserId: string;
    role: TenantUserRole;
}

export interface ParlamentarianJwtPayload {
    sessionType: 'parliamentarian';
    sub: string;
    tenantId: string;
    parliamentarianUserId: string;
    parliamentarianId: string;
    parliamentaryName: string;
}

/** Super admin da plataforma SaaS — sem tenantId. */
export interface PlatformJwtPayload {
    sessionType: 'platform';
    sub: string;
}

export type JwtPayload =
    | StaffJwtPayload
    | ParlamentarianJwtPayload
    | PlatformJwtPayload;

export function isStaffSession(p: JwtPayload): p is StaffJwtPayload {
    return p.sessionType === 'staff';
}

export function isParlamentarianSession(p: JwtPayload): p is ParlamentarianJwtPayload {
    return p.sessionType === 'parliamentarian';
}

export function isPlatformSession(p: JwtPayload): p is PlatformJwtPayload {
    return p.sessionType === 'platform';
}
