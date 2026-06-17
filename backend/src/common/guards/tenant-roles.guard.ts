import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleUsuario, TenantUserRole } from '@prisma/client';
import {
    PARLIAMENTARIAN_SESSION,
    TenantRoleRequirement,
} from '../../auth/guards/guard-combos';
import { TENANT_ROLES_KEY } from '../decorators/tenant-roles.decorator';
import {
    AuthenticatedUser,
    isParlamentarianUser,
    isStaffUser,
} from '../types/authenticated-request';

const SIGL_WRITE_ROLES: RoleUsuario[] = [
    RoleUsuario.MASTER,
    RoleUsuario.ADMIN,
    RoleUsuario.OPERADOR,
];

@Injectable()
export class TenantRolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const required = this.reflector.getAllAndOverride<TenantRoleRequirement[]>(
            TENANT_ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (!required?.length) return true;

        const { user } = context
            .switchToHttp()
            .getRequest<{ user?: AuthenticatedUser }>();
        if (!user) {
            throw new ForbiddenException('Autenticação necessária');
        }

        if (user.authType === 'sigl') {
            if (user.role && SIGL_WRITE_ROLES.includes(user.role)) {
                return true;
            }
            throw new ForbiddenException('Você não tem permissão para realizar esta ação');
        }

        const allowsParliamentarian = required.includes(PARLIAMENTARIAN_SESSION);
        const staffRoles = required.filter(
            (r): r is TenantUserRole => r !== PARLIAMENTARIAN_SESSION,
        );

        if (isParlamentarianUser(user)) {
            if (allowsParliamentarian) return true;
            throw new ForbiddenException('Você não tem permissão para realizar esta ação');
        }

        if (isStaffUser(user)) {
            if (staffRoles.length && staffRoles.includes(user.role)) {
                return true;
            }
            throw new ForbiddenException('Você não tem permissão para realizar esta ação');
        }

        throw new ForbiddenException('Você não tem permissão para realizar esta ação');
    }
}
