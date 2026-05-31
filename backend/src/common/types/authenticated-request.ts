import { RoleUsuario, TenantUserRole } from '@prisma/client';
import { Request } from 'express';

export type AuthType = 'sigl' | 'camara';

export type AuthenticatedUser = {
  id: string;
  authType: AuthType;
  /** Preenchido para operações da câmara (claim JWT `tid`). */
  tenantId?: string;
  tenantRole?: TenantUserRole;
  isAdmin?: boolean;
  /** Login SIGL (Usuario). */
  username?: string;
  nome?: string;
  role?: RoleUsuario;
  email?: string;
};

export type RequestWithTenant = Request & {
  user: AuthenticatedUser;
  tenantId: string;
};
