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

export type JwtPayload = StaffJwtPayload | ParlamentarianJwtPayload;

export function isStaffSession(p: JwtPayload): p is StaffJwtPayload {
    return p.sessionType === 'staff';
}

export function isParlamentarianSession(p: JwtPayload): p is ParlamentarianJwtPayload {
    return p.sessionType === 'parliamentarian';
}
