import { Inject, Injectable } from '@nestjs/common';
import { TenantRepository } from '../../domain/tenant.repository';
import { TENANT_REPOSITORY } from '../../tenants.tokens';
import { TenantNotFoundError } from '../errors/tenant-not-found.error';

@Injectable()
export class DeleteTenantUseCase {
    constructor(
        @Inject(TENANT_REPOSITORY)
        private readonly tenantRepository: TenantRepository,
    ) {}

    async execute(id: string): Promise<void> {
        const tenant = await this.tenantRepository.findById(id);
        if (!tenant) {
            throw new TenantNotFoundError(id);
        }

        tenant.remove();
        await this.tenantRepository.update(tenant);
    }
}
