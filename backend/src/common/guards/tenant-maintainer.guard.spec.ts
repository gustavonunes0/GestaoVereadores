import { ForbiddenException } from '@nestjs/common';
import { RoleUsuario } from '@prisma/client';
import { TenantMaintainerGuard } from './tenant-maintainer.guard';

describe('TenantMaintainerGuard', () => {
    const guard = new TenantMaintainerGuard();

    const context = (user: object) =>
        ({
            switchToHttp: () => ({
                getRequest: () => ({ user }),
            }),
        }) as never;

    it('permite isTenantAdmin', () => {
        expect(
            guard.canActivate(
                context({ isTenantAdmin: true, isTenantStaff: false }),
            ),
        ).toBe(true);
    });

    it('permite isTenantStaff', () => {
        expect(
            guard.canActivate(
                context({ isTenantAdmin: false, isTenantStaff: true }),
            ),
        ).toBe(true);
    });

    it('bloqueia usuário sem admin/staff', () => {
        expect(() =>
            guard.canActivate(
                context({
                    isTenantAdmin: false,
                    isTenantStaff: false,
                    isParliamentarian: true,
                }),
            ),
        ).toThrow(ForbiddenException);
    });

    it('permite operador SIGL', () => {
        expect(
            guard.canActivate(
                context({
                    authType: 'sigl',
                    role: RoleUsuario.OPERADOR,
                }),
            ),
        ).toBe(true);
    });
});
