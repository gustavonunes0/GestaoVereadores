import { TenantUserEntity } from '../entities/tenant-user.entity';

export abstract class TenantUserRepository {
    abstract create(tenantUser: TenantUserEntity): Promise<TenantUserEntity>;
    abstract findAll(filters?: {
        tenantId?: string;
        userId?: string;
    }): Promise<TenantUserEntity[]>;
    abstract findById(id: string): Promise<TenantUserEntity | null>;
    abstract findByIdForTenant(
        tenantId: string,
        id: string,
    ): Promise<TenantUserEntity | null>;
    abstract findByTenantAndUser(
        tenantId: string,
        userId: string,
    ): Promise<TenantUserEntity | null>;
    abstract update(tenantUser: TenantUserEntity): Promise<TenantUserEntity>;
    abstract remove(id: string): Promise<void>;
}
