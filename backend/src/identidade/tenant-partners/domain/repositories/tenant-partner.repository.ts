import { PaginatedResult } from '../../../../common/dto/pagination.dto';
import { TenantPartnerEntity } from '../entities/tenant-partner.entity';

export type ListTenantPartnersRepositoryQuery = {
    nome?: string;
    page?: number;
    limit?: number;
};

export abstract class TenantPartnerRepository {
    abstract create(partner: TenantPartnerEntity): Promise<TenantPartnerEntity>;
    abstract findMany(
        tenantId: string,
        query: ListTenantPartnersRepositoryQuery,
    ): Promise<PaginatedResult<TenantPartnerEntity>>;
    abstract findDefaultTipoAutorId(): Promise<string | null>;
    abstract findById(tenantId: string, id: string): Promise<TenantPartnerEntity | null>;
    abstract update(partner: TenantPartnerEntity): Promise<TenantPartnerEntity>;
    abstract remove(tenantId: string, id: string): Promise<void>;
}
