import { RoleUsuario, TenantUserRole } from '@prisma/client';
import { AuthType } from '../../../common/types/authenticated-request';

export type JwtPayload = {
    sub: string;
    authType: AuthType;
    tid?: string;
    tenantUserId?: string;
    tenantUserRole?: TenantUserRole;
    parliamentarianId?: string;
    isTenantAdmin?: boolean;
    isTenantStaff?: boolean;
    isParliamentarian?: boolean;
    /** @deprecated use isTenantAdmin */
    isAdmin?: boolean;
    username?: string;
    role?: RoleUsuario;
};
