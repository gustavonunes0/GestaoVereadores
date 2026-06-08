/** SIGL platform user roles (Usuario.role). */
export type SiglRole = 'MASTER' | 'ADMIN' | 'OPERADOR';

/** Câmara tenant user roles (TenantUser.role). */
export type CamaraRole = 'ADMIN' | 'OWNER' | 'MANAGER' | 'VIEWER';

export type AuthType = 'sigl' | 'camara';

export type AuthUser = {
    id: string;
    nome: string;
    role: string;
    authType?: AuthType;
    username?: string;
    email?: string;
    tenantId?: string;
    tenantName?: string;
    isAdmin?: boolean;
    ativo?: boolean;
};

export type LoginResponse = {
    access_token: string;
    user: AuthUser;
};
