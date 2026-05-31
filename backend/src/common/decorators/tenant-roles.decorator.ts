import { SetMetadata } from '@nestjs/common';
import { TenantUserRole } from '@prisma/client';

export const TENANT_ROLES_KEY = 'tenantRoles';

/** Papéis do vínculo TenantUser (login câmara). MASTER SIGL ignora esta checagem. */
export const TenantRoles = (...roles: TenantUserRole[]) =>
  SetMetadata(TENANT_ROLES_KEY, roles);
