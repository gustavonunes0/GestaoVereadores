import {
    createParamDecorator,
    ExecutionContext,
    InternalServerErrorException,
} from '@nestjs/common';
import { RequestWithTenant } from '../types/authenticated-request';

export const TenantId = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): string => {
        const request = ctx.switchToHttp().getRequest<RequestWithTenant>();
        if (!request.tenantId) {
            throw new InternalServerErrorException(
                'Contexto de tenant indisponível — verifique TenantGuard',
            );
        }
        return request.tenantId;
    },
);
