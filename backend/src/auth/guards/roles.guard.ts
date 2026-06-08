import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleUsuario } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

type RequestUser = { role?: RoleUsuario };

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const required = this.reflector.getAllAndOverride<RoleUsuario[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (!required?.length) return true;

        const { user } = context
            .switchToHttp()
            .getRequest<{ user?: RequestUser }>();
        if (!user?.role || !required.includes(user.role)) {
            throw new ForbiddenException('Sem permissão para esta operação');
        }
        return true;
    }
}
