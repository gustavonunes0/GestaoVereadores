import { ForbiddenException } from '@nestjs/common';
import { TenantUserRole } from '@prisma/client';
import { TenantMaintainerGuard } from './tenant-maintainer.guard';

describe('TenantMaintainerGuard', () => {
    const guard = new TenantMaintainerGuard();

    const context = (user: object) =>
        ({
            switchToHttp: () => ({
                getRequest: () => ({ user }),
            }),
        }) as never;

    it('permite ADMIN_STAFF', () => {
        expect(
            guard.canActivate(
                context({
                    authType: 'camara',
                    sessionType: 'staff',
                    role: TenantUserRole.ADMIN_STAFF,
                }),
            ),
        ).toBe(true);
    });

    it('permite STAFF', () => {
        expect(
            guard.canActivate(
                context({
                    authType: 'camara',
                    sessionType: 'staff',
                    role: TenantUserRole.STAFF,
                }),
            ),
        ).toBe(true);
    });

    it('bloqueia parlamentar', () => {
        expect(() =>
            guard.canActivate(
                context({
                    authType: 'camara',
                    sessionType: 'parliamentarian',
                    parliamentarianId: 'parl-1',
                }),
            ),
        ).toThrow(ForbiddenException);
    });
});
