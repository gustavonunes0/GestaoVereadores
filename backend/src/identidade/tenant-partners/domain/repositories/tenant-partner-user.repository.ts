import { TenantPartnerUserEntity } from '../entities/tenant-partner-user.entity';

export type TenantPartnerUserLink = {
    tenantPartnerId: string;
    userId: string;
};

export abstract class TenantPartnerUserRepository {
    abstract create(partnerUser: TenantPartnerUserEntity): Promise<TenantPartnerUserEntity>;
    abstract findByPartnerId(tenantPartnerId: string): Promise<TenantPartnerUserEntity | null>;
    abstract findLinkedPartnerIds(tenantPartnerIds: string[]): Promise<string[]>;
    abstract findLinksByPartnerIds(
        tenantPartnerIds: string[],
    ): Promise<TenantPartnerUserLink[]>;
    abstract removeByPartnerId(tenantPartnerId: string): Promise<void>;
}
