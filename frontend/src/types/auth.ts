export type SessionType = 'staff' | 'parliamentarian' | 'platform';

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
    /** Logo da câmara (data URL ou path). */
    tenantLogo?: string | null;
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
    /** Logo da câmara (data URL ou path). */
    tenantLogo?: string | null;
    photoUrl?: string;
}

export interface PlatformUser {
    sessionType: 'platform';
    id: string;
    name: string;
    cpf: string | null;
    email?: string;
    isPlatformAdmin: true;
}

export type AuthUser = StaffUser | ParlamentarianUser | PlatformUser;

export function isStaffUser(u: AuthUser): u is StaffUser {
    return u.sessionType === 'staff';
}

export function isParlamentarianUser(u: AuthUser): u is ParlamentarianUser {
    return u.sessionType === 'parliamentarian';
}

export function isPlatformUser(u: AuthUser): u is PlatformUser {
    return u.sessionType === 'platform';
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
