export type SessionType = 'staff' | 'parliamentarian';

export interface StaffUser {
    sessionType: 'staff';
    id: string;
    tenantId: string;
    tenantUserId: string;
    name: string;
    cpf: string;
    email?: string;
    role: 'ADMIN_STAFF' | 'STAFF';
    tenantName?: string;
    photoUrl?: string;
}

export interface ParlamentarianUser {
    sessionType: 'parliamentarian';
    id: string;
    tenantId: string;
    parliamentarianUserId: string;
    parliamentarianId: string;
    name: string;
    parliamentaryName: string;
    cpf: string;
    email?: string;
    tenantName?: string;
    photoUrl?: string;
}

export type AuthUser = StaffUser | ParlamentarianUser;

export function isStaffUser(u: AuthUser): u is StaffUser {
    return u.sessionType === 'staff';
}

export function isParlamentarianUser(u: AuthUser): u is ParlamentarianUser {
    return u.sessionType === 'parliamentarian';
}

export interface LoginRequest {
    cpf: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    sessionType: SessionType;
    user: AuthUser;
}
