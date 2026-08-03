import { TenantUserRole } from '@prisma/client';
import { Roles } from '../../auth/decorators/roles.decorator';

/** Staff da câmara (leitura de recursos de plataforma. */
export const ReadRoles = () =>
    Roles(TenantUserRole.ADMIN_STAFF, TenantUserRole.STAFF);

/** Mutações de plataforma (antes: MASTER/ADMIN SIGL). */
export const WriteRoles = () => Roles(TenantUserRole.ADMIN_STAFF);

/** Administração de platform endpoints (substitui RoleUsuario.MASTER). */
export const MasterOnly = () => Roles(TenantUserRole.ADMIN_STAFF);
