import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PLATFORM_ADMIN_KEY } from '../decorators/platform-only.decorator';
import {
    AuthenticatedUser,
    isPlatformUser,
} from '../types/authenticated-request';

@Injectable()
export class PlatformAdminGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const required = this.reflector.getAllAndOverride<boolean>(
            PLATFORM_ADMIN_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (!required) return true;

        const { user } = context
            .switchToHttp()
            .getRequest<{ user?: AuthenticatedUser }>();

        if (!user || !isPlatformUser(user)) {
            throw new ForbiddenException(
                'Acesso restrito ao super administrador da plataforma',
            );
        }
        return true;
    }
}
