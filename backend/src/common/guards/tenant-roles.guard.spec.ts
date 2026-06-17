import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantUserRole } from '@prisma/client';
import { PARLIAMENTARIAN_SESSION } from '../../auth/guards/guard-combos';
import { TENANT_ROLES_KEY } from '../decorators/tenant-roles.decorator';
import { TenantRolesGuard } from './tenant-roles.guard';

function makeContext(user: object | undefined, roles?: Array<TenantUserRole | typeof PARLIAMENTARIAN_SESSION>) {
    const reflector = {
        getAllAndOverride: jest.fn().mockReturnValue(roles),
    } as unknown as Reflector;

    const guard = new TenantRolesGuard(reflector);

    const context = {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
            getRequest: () => ({ user }),
        }),
    } as unknown as ExecutionContext;

    return { guard, reflector, context };
}

describe('TenantRolesGuard', () => {
    it('permite acesso quando não há @TenantRoles() no endpoint', () => {
        const { guard, context } = makeContext(
            { authType: 'camara', sessionType: 'staff', role: TenantUserRole.STAFF },
            undefined,
        );
        expect(guard.canActivate(context)).toBe(true);
    });

    it('permite ADMIN_STAFF em endpoint com ADMIN_STAFF, STAFF', () => {
        const { guard, context } = makeContext(
            {
                authType: 'camara',
                sessionType: 'staff',
                role: TenantUserRole.ADMIN_STAFF,
            },
            [TenantUserRole.ADMIN_STAFF, TenantUserRole.STAFF],
        );
        expect(guard.canActivate(context)).toBe(true);
    });

    it('rejeita parlamentar em endpoint com ADMIN_ONLY', () => {
        const { guard, context } = makeContext(
            {
                authType: 'camara',
                sessionType: 'parliamentarian',
                parliamentarianId: 'parl-1',
            },
            [TenantUserRole.ADMIN_STAFF],
        );
        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('rejeita STAFF em endpoint com PARLIAMENTARIAN_ONLY', () => {
        const { guard, context } = makeContext(
            {
                authType: 'camara',
                sessionType: 'staff',
                role: TenantUserRole.STAFF,
            },
            [PARLIAMENTARIAN_SESSION],
        );
        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('permite parlamentar em endpoint exclusivo de voto', () => {
        const { guard, context } = makeContext(
            {
                authType: 'camara',
                sessionType: 'parliamentarian',
                parliamentarianId: 'parl-1',
            },
            [PARLIAMENTARIAN_SESSION],
        );
        expect(guard.canActivate(context)).toBe(true);
    });

    it('lança ForbiddenException quando usuário não está autenticado', () => {
        const { guard, context } = makeContext(undefined, [TenantUserRole.ADMIN_STAFF]);
        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('permite usuário SIGL com role MASTER em endpoint com @TenantRoles()', () => {
        const { guard, context } = makeContext(
            { authType: 'sigl', role: 'MASTER' },
            [TenantUserRole.ADMIN_STAFF],
        );
        expect(guard.canActivate(context)).toBe(true);
    });
});
