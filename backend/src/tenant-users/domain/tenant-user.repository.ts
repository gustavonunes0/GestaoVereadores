import { TenantUserEntity } from './tenant-user.entity';

export interface TenantUserRepository {
    create(tenantUser: TenantUserEntity): Promise<TenantUserEntity>;
    findAll(filters?: {
        tenantId?: string;
        userId?: string;
    }): Promise<TenantUserEntity[]>;
    findById(id: string): Promise<TenantUserEntity | null>;
    findByTenantAndUser(
        tenantId: string,
        userId: string,
    ): Promise<TenantUserEntity | null>;
    update(tenantUser: TenantUserEntity): Promise<TenantUserEntity>;
    remove(id: string): Promise<void>;
}
