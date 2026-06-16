export type TenantUserRole = 'ADMIN_STAFF' | 'STAFF' | 'PARLIAMENTARIAN';

export interface AuthUser {
    id: string;
    tenantUserId: string;
    tenantId: string;
    name: string;
    cpf: string;
    email?: string;
    role: TenantUserRole;
    parliamentarianId?: string;
    parliamentaryName?: string;
    photoUrl?: string;
    tenantName?: string;
}

export interface LoginRequest {
    cpf: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    user: AuthUser;
}
