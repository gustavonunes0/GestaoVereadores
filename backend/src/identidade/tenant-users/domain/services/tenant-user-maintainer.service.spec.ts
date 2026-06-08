import { TenantUserEntity, TenantUserStatus } from '../entities/tenant-user.entity';
import { TenantUserMaintainerService } from './tenant-user-maintainer.service';

describe('TenantUserMaintainerService', () => {
    const service = new TenantUserMaintainerService();

    const buildTenantUser = (flags: {
        isTenantAdmin: boolean;
        isTenantStaff: boolean;
    }) =>
        TenantUserEntity.restore({
            id: 'tu-1',
            tenantId: 'tenant-1',
            userId: 'user-1',
            isParliamentarian: false,
            status: TenantUserStatus.ACTIVE,
            permissions: [],
            lastAccessAt: null,
            removedAt: null,
            createdAt: new Date(),
            createdBy: null,
            modifiedAt: new Date(),
            modifiedBy: null,
            isRemoved: false,
            ...flags,
        });

    it('identifica admin como mantenedor', () => {
        expect(
            service.canMaintainTenantUser(
                buildTenantUser({ isTenantAdmin: true, isTenantStaff: false }),
            ),
        ).toBe(true);
    });

    it('identifica staff como mantenedor', () => {
        expect(
            service.canMaintainTenantUser(
                buildTenantUser({ isTenantAdmin: false, isTenantStaff: true }),
            ),
        ).toBe(true);
    });

    it('rejeita parlamentar sem admin/staff', () => {
        expect(
            service.canMaintain({
                isTenantAdmin: false,
                isTenantStaff: false,
            }),
        ).toBe(false);
    });
});
