import { RoleUsuario, TenantUserRole } from '@prisma/client';
import { AuthType } from '../common/types/authenticated-request';

export type JwtPayload = {
  sub: string;
  authType: AuthType;
  tid?: string;
  tenantRole?: TenantUserRole;
  isAdmin?: boolean;
  username?: string;
  role?: RoleUsuario;
};
