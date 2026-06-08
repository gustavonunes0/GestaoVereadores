import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleUsuario } from '@prisma/client';
import {
    LegacyTenantRole,
    matchesLegacyTenantRole,
} from '../auth/legacy-tenant-role';
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
        const required = this.reflector.getAllAndOverride<LegacyTenantRole[]>(
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
            throw new ForbiddenException('Sem permissão para esta operação');
        }

        const flags = {
            isTenantAdmin: user.isTenantAdmin ?? user.isAdmin,
            isTenantStaff: user.isTenantStaff,
            isParliamentarian: user.isParliamentarian,
        };

        if (flags.isTenantAdmin) return true;

        const allowed = required.some((role) =>
            matchesLegacyTenantRole(role, flags),
        );
        if (allowed) return true;

        throw new ForbiddenException('Sem permissão para esta operação');
    }
}
