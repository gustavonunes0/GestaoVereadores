import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { RoleUsuario } from '@prisma/client';
import { isTenantMaintainer } from '../auth/tenant-maintainer';
import { AuthenticatedUser } from '../types/authenticated-request';

const SIGL_WRITE_ROLES: RoleUsuario[] = [
    RoleUsuario.MASTER,
    RoleUsuario.ADMIN,
    RoleUsuario.OPERADOR,
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
                'Sem permissão para manter dados da Câmara',
            );
        }

        if (
            isTenantMaintainer({
                isTenantAdmin: user.isTenantAdmin ?? user.isAdmin,
                isTenantStaff: user.isTenantStaff,
            })
        ) {
            return true;
        }

        throw new ForbiddenException(
            'Sem permissão para manter dados da Câmara',
        );
    }
}
