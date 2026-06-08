import { Inject, Injectable } from '@nestjs/common';
import { TenantPrimitives } from '../../domain/tenant.entity';
import { TenantRepository } from '../../domain/tenant.repository';
import { TENANT_REPOSITORY } from '../../tenants.tokens';
import { TenantNotFoundError } from '../errors/tenant-not-found.error';

@Injectable()
export class FindTenantByIdUseCase {
    constructor(
        @Inject(TENANT_REPOSITORY)
        private readonly tenantRepository: TenantRepository,
    ) {}

    async execute(id: string): Promise<TenantPrimitives> {
        const tenant = await this.tenantRepository.findById(id);
        if (!tenant) {
            throw new TenantNotFoundError(id);
        }

        return tenant.toPrimitives();
    }
}
