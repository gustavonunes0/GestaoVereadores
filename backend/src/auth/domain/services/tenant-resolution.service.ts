import { TenantAuthEntity } from '../entities/tenant-access.entity';
import { TenantAuthRepository } from '../repositories/tenant-auth.repository';

export class TenantNotFoundDomainError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TenantNotFoundDomainError';
    }
}

export class TenantResolutionRequiredDomainError extends Error {
    constructor() {
        super('Informe tenantId ou tenantCnpj');
        this.name = 'TenantResolutionRequiredDomainError';
    }
}

export class TenantResolutionService {
    normalizeCnpj(value: string): string {
        return value.replace(/\D/g, '');
    }

    async resolveOptionalTenantId(
        tenantId: string | undefined,
        repository: TenantAuthRepository,
    ): Promise<string | undefined> {
        if (tenantId) {
            const tenant = await repository.findActiveById(tenantId);
            if (!tenant) {
                throw new TenantNotFoundDomainError(
                    'Câmara inválida ou inativa',
                );
            }
            return tenant.id;
        }

        const defaultTenant = await repository.findFirstActive();
        return defaultTenant?.id;
    }

    async resolveCamaraTenant(
        tenantId: string | undefined,
        tenantCnpj: string | undefined,
        repository: TenantAuthRepository,
    ): Promise<TenantAuthEntity> {
        if (tenantId) {
            const tenant = await repository.findActiveById(tenantId);
            if (!tenant) {
                throw new TenantNotFoundDomainError(
                    'Câmara inválida ou inativa',
                );
            }
            return tenant;
        }

        if (tenantCnpj) {
            const cnpj = this.normalizeCnpj(tenantCnpj);
            const tenant = await repository.findActiveByCnpj(cnpj);
            if (!tenant) {
                throw new TenantNotFoundDomainError(
                    'Câmara não encontrada para o CNPJ informado',
                );
            }
            return tenant;
        }

        throw new TenantResolutionRequiredDomainError();
    }
}
