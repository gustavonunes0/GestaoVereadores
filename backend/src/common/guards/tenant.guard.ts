import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantStatus } from '@prisma/client';
import { IS_PUBLIC_KEY } from '../../auth/decorators/public.decorator';
import { SKIP_TENANT_KEY } from '../decorators/skip-tenant.decorator';
import {
    AuthenticatedUser,
    RequestWithTenant,
} from '../types/authenticated-request';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly prisma: PrismaService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (isPublic) return true;

        const skipTenant = this.reflector.getAllAndOverride<boolean>(
            SKIP_TENANT_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (skipTenant) return true;

        const request = context.switchToHttp().getRequest<RequestWithTenant>();
        const user = request.user as AuthenticatedUser | undefined;
        if (!user) {
            throw new ForbiddenException('Autenticação necessária');
        }

        const tenantId = user.tenantId;
        if (!tenantId) {
            throw new ForbiddenException(
                'Selecione uma câmara (tenant) no login para acessar este recurso',
            );
        }

        const tenant = await this.prisma.tenant.findFirst({
            where: { id: tenantId, isRemoved: false },
            select: { id: true, status: true },
        });

        if (!tenant) {
            throw new ForbiddenException('Câmara não encontrada');
        }

        if (tenant.status !== TenantStatus.ACTIVE) {
            throw new ForbiddenException('Câmara inativa ou suspensa');
        }

        request.tenantId = tenant.id;
        return true;
    }
}
