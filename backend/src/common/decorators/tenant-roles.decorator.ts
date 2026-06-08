import { SetMetadata } from '@nestjs/common';
import { LegacyTenantRole } from '../auth/legacy-tenant-role';

export const TENANT_ROLES_KEY = 'tenantRoles';

export const TenantRoles = (...roles: LegacyTenantRole[]) =>
    SetMetadata(TENANT_ROLES_KEY, roles);
