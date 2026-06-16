import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleUsuario, TenantUserRole } from '@prisma/client';
import { TENANT_ROLES_KEY } from '../decorators/tenant-roles.decorator';
import { AuthenticatedUser } from '../types/authenticated-request';

const SIGL_WRITE_ROLES: RoleUsuario[] = [
    RoleUsuario.MASTER,
    RoleUsuario.ADMIN,
    RoleUsuario.OPERADOR,
];

@Injectable()
export class TenantRolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const required = this.reflector.getAllAndOverride<TenantUserRole[]>(
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

        if (!user.tenantUserRole || !required.includes(user.tenantUserRole)) {
            throw new ForbiddenException('Você não tem permissão para realizar esta ação');
        }

        return true;
    }
}
