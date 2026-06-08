import { RoleUsuario } from '@prisma/client';

export type AuthType = 'sigl' | 'camara';

export type AuthenticatedUser = {
    id: string;
    authType: AuthType;
    tenantId?: string;
    isTenantAdmin?: boolean;
    isTenantStaff?: boolean;
    isParliamentarian?: boolean;
    /** @deprecated use isTenantAdmin */
    isAdmin?: boolean;
    username?: string;
    nome?: string;
    email?: string;
    role?: RoleUsuario;
};

export type RequestWithTenant = {
    tenantId?: string;
    user?: AuthenticatedUser;
};
