import { Inject, Injectable } from '@nestjs/common';
import { TenantPrimitives } from '../../domain/tenant.entity';
import { TenantRepository } from '../../domain/tenant.repository';
import { TENANT_REPOSITORY } from '../../tenants.tokens';

@Injectable()
export class FindAllTenantsUseCase {
    constructor(
        @Inject(TENANT_REPOSITORY)
        private readonly tenantRepository: TenantRepository,
    ) {}

    async execute(): Promise<TenantPrimitives[]> {
        const tenants = await this.tenantRepository.findAll();
        return tenants.map((tenant) => tenant.toPrimitives());
    }
}
