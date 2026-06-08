import { isTenantMaintainer } from '../../../../common/auth/tenant-maintainer';
import { TenantUserEntity } from '../entities/tenant-user.entity';

export class TenantUserMaintainerService {
    canMaintain(flags: {
        isTenantAdmin?: boolean;
        isTenantStaff?: boolean;
    }): boolean {
        return isTenantMaintainer(flags);
    }

    canMaintainTenantUser(tenantUser: TenantUserEntity): boolean {
        const flags = tenantUser.toPrimitives();
        return this.canMaintain({
            isTenantAdmin: flags.isTenantAdmin,
            isTenantStaff: flags.isTenantStaff,
        });
    }

    assertCanMaintain(flags: {
        isTenantAdmin?: boolean;
        isTenantStaff?: boolean;
    }): void {
        if (!this.canMaintain(flags)) {
            throw new Error(
                'Usuário não possui permissão para manter o sistema da Câmara',
            );
        }
    }
}
