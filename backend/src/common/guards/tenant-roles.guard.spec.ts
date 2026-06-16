import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantUserRole } from '@prisma/client';
import { TENANT_ROLES_KEY } from '../decorators/tenant-roles.decorator';
import { TenantRolesGuard } from './tenant-roles.guard';

function makeContext(user: object | undefined, roles?: TenantUserRole[]) {
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
        const { guard, context } = makeContext({ tenantUserRole: TenantUserRole.STAFF }, undefined);
        expect(guard.canActivate(context)).toBe(true);
    });

    it('permite acesso quando @TenantRoles() lista está vazia', () => {
        const { guard, context } = makeContext({ tenantUserRole: TenantUserRole.STAFF }, []);
        expect(guard.canActivate(context)).toBe(true);
    });

    it('permite ADMIN_STAFF em endpoint com ADMIN_STAFF, STAFF', () => {
        const { guard, context } = makeContext(
            { tenantUserRole: TenantUserRole.ADMIN_STAFF, authType: 'camara' },
            [TenantUserRole.ADMIN_STAFF, TenantUserRole.STAFF],
        );
        expect(guard.canActivate(context)).toBe(true);
    });

    it('permite STAFF em endpoint com ADMIN_STAFF, STAFF', () => {
        const { guard, context } = makeContext(
            { tenantUserRole: TenantUserRole.STAFF, authType: 'camara' },
            [TenantUserRole.ADMIN_STAFF, TenantUserRole.STAFF],
        );
        expect(guard.canActivate(context)).toBe(true);
    });

    it('rejeita PARLIAMENTARIAN em endpoint com ADMIN_ONLY com mensagem em português', () => {
        const { guard, context } = makeContext(
            { tenantUserRole: TenantUserRole.PARLIAMENTARIAN, authType: 'camara' },
            [TenantUserRole.ADMIN_STAFF],
        );
        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
        expect(() => guard.canActivate(context)).toThrow(
            'Você não tem permissão para realizar esta ação',
        );
    });

    it('rejeita STAFF em endpoint com PARLIAMENTARIAN_ONLY', () => {
        const { guard, context } = makeContext(
            { tenantUserRole: TenantUserRole.STAFF, authType: 'camara' },
            [TenantUserRole.PARLIAMENTARIAN],
        );
        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('permite PARLIAMENTARIAN em endpoint exclusivo de voto', () => {
        const { guard, context } = makeContext(
            { tenantUserRole: TenantUserRole.PARLIAMENTARIAN, authType: 'camara' },
            [TenantUserRole.PARLIAMENTARIAN],
        );
        expect(guard.canActivate(context)).toBe(true);
    });

    it('lança ForbiddenException quando usuário não está autenticado', () => {
        const { guard, context } = makeContext(
            undefined,
            [TenantUserRole.ADMIN_STAFF],
        );
        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('permite usuário SIGL com role MASTER em endpoint com @TenantRoles()', () => {
        const { guard, context } = makeContext(
            { authType: 'sigl', role: 'MASTER' },
            [TenantUserRole.ADMIN_STAFF],
        );
        expect(guard.canActivate(context)).toBe(true);
    });

    it('rejeita STAFF tentando acessar endpoint com REFLECTOR key correto', () => {
        const reflector = new Reflector();
        const guard = new TenantRolesGuard(reflector);
        const mockGetAllAndOverride = jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([TenantUserRole.ADMIN_STAFF]);

        const context = {
            getHandler: () => ({}),
            getClass: () => ({}),
            switchToHttp: () => ({
                getRequest: () => ({ user: { tenantUserRole: TenantUserRole.STAFF, authType: 'camara' } }),
            }),
        } as unknown as ExecutionContext;

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
        expect(mockGetAllAndOverride).toHaveBeenCalledWith(TENANT_ROLES_KEY, expect.any(Array));
    });
});
