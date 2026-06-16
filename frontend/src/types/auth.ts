/** SIGL platform user roles (Usuario.role). */
export type SiglRole = 'MASTER' | 'ADMIN' | 'OPERADOR';

/** Câmara tenant user roles (TenantUser.role). */
export type CamaraRole = 'ADMIN' | 'OWNER' | 'MANAGER' | 'VIEWER';

/** Novo enum de roles para TenantUser do backend. */
export type TenantUserRole = 'ADMIN_STAFF' | 'STAFF' | 'PARLIAMENTARIAN';

export type AuthType = 'sigl' | 'camara';

export type AuthUser = {
    id: string;
    nome: string;
    name?: string;
    role: TenantUserRole | SiglRole | CamaraRole | string;
    authType?: AuthType;
    username?: string;
    email?: string;
    tenantId?: string;
    tenantUserId?: string;
    tenantName?: string;
    parliamentarianId?: string;
    isAdmin?: boolean;
    ativo?: boolean;
};

export type LoginResponse = {
    access_token: string;
    user: AuthUser;
};
