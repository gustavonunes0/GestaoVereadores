import { SetMetadata } from '@nestjs/common';
import {
    TenantRoleRequirement,
} from '../../auth/guards/guard-combos';

export const TENANT_ROLES_KEY = 'tenantRoles';

export const TenantRoles = (...roles: TenantRoleRequirement[]) =>
    SetMetadata(TENANT_ROLES_KEY, roles);
