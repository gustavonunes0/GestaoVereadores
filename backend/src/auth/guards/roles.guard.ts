import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantUserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import {
    AuthenticatedUser,
    isStaffUser,
} from '../../common/types/authenticated-request';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const required = this.reflector.getAllAndOverride<TenantUserRole[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (!required?.length) return true;

        const { user } = context
            .switchToHttp()
            .getRequest<{ user?: AuthenticatedUser }>();

        if (!user || !isStaffUser(user) || !required.includes(user.role)) {
            throw new ForbiddenException('Sem permissão para esta operação');
        }
        return true;
    }
}
