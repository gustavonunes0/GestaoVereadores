import { TenantAuthEntity } from '../entities/tenant-access.entity';

export abstract class TenantAuthRepository {
    abstract findActiveById(id: string): Promise<TenantAuthEntity | null>;

    abstract findActiveByCnpj(cnpj: string): Promise<TenantAuthEntity | null>;

    abstract findFirstActive(): Promise<TenantAuthEntity | null>;
}
