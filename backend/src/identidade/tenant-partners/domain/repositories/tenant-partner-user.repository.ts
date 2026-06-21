import { TenantPartnerUserEntity } from '../entities/tenant-partner-user.entity';

export abstract class TenantPartnerUserRepository {
    abstract create(partnerUser: TenantPartnerUserEntity): Promise<TenantPartnerUserEntity>;
    abstract findByPartnerId(tenantPartnerId: string): Promise<TenantPartnerUserEntity | null>;
    abstract findLinkedPartnerIds(tenantPartnerIds: string[]): Promise<string[]>;
    abstract removeByPartnerId(tenantPartnerId: string): Promise<void>;
}
