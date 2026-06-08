import { TenantUserEntity } from '../../domain/entities/tenant-user.entity';

export class TenantUserViewModel {
    static toHttp(tenantUser: TenantUserEntity) {
        const data = tenantUser.toPrimitives();

        return {
            id: data.id,
            tenantId: data.tenantId,
            userId: data.userId,
            isTenantAdmin: data.isTenantAdmin,
            isTenantStaff: data.isTenantStaff,
            isParliamentarian: data.isParliamentarian,
            status: data.status,
            lastAccessAt: data.lastAccessAt,
            createdAt: data.createdAt,
            modifiedAt: data.modifiedAt,
        };
    }

    static toHttpAdmin(tenantUser: TenantUserEntity) {
        const data = tenantUser.toPrimitives();

        return {
            ...TenantUserViewModel.toHttp(tenantUser),
            permissions: data.permissions,
        };
    }
}
