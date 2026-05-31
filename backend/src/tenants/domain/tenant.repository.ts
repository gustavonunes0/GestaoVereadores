import { TenantEntity } from './tenant.entity';

export interface TenantRepository {
    create(tenant: TenantEntity): Promise<TenantEntity>;
    findAll(): Promise<TenantEntity[]>;
    findById(id: string): Promise<TenantEntity | null>;
    findByCnpj(cnpj: string): Promise<TenantEntity | null>;
    update(tenant: TenantEntity): Promise<TenantEntity>;
    remove(id: string): Promise<void>;
}
