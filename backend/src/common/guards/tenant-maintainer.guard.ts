import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { RoleUsuario, TenantUserRole } from '@prisma/client';
import { AuthenticatedUser, isStaffUser } from '../types/authenticated-request';

const SIGL_WRITE_ROLES: RoleUsuario[] = [
    RoleUsuario.MASTER,
    RoleUsuario.ADMIN,
    RoleUsuario.OPERADOR,
];

const MAINTAINER_ROLES: TenantUserRole[] = [
    TenantUserRole.ADMIN_STAFF,
    TenantUserRole.STAFF,
];

@Injectable()
export class TenantMaintainerGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
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
            throw new ForbiddenException(
                'Você não tem permissão para realizar esta ação',
            );
        }

        if (isStaffUser(user) && MAINTAINER_ROLES.includes(user.role)) {
            return true;
        }

        throw new ForbiddenException(
            'Você não tem permissão para realizar esta ação',
        );
    }
}
