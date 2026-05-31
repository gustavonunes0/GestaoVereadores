import { Inject, Injectable } from '@nestjs/common';
import { TenantEntity, TenantPrimitives } from '../../domain/tenant.entity';
import { TenantRepository } from '../../domain/tenant.repository';
import { TENANT_REPOSITORY } from '../../tenants.tokens';
import { CreateTenantDto } from '../dtos/requests/create-tenant.request';
import { TenantCnpjAlreadyInUseError } from '../errors/tenant-cnpj-already-in-use.error';

@Injectable()
export class CreateTenantUseCase {
    constructor(
        @Inject(TENANT_REPOSITORY)
        private readonly tenantRepository: TenantRepository,
    ) {}

    async execute(dto: CreateTenantDto): Promise<TenantPrimitives> {
        const normalizedCnpj = dto.cnpj.replace(/\D/g, '');
        const existingTenant =
            await this.tenantRepository.findByCnpj(normalizedCnpj);
        if (existingTenant) {
            throw new TenantCnpjAlreadyInUseError(normalizedCnpj);
        }

        const tenant = TenantEntity.create({
            name: dto.name,
            cnpj: normalizedCnpj,
            logo: dto.logo,
            status: dto.status,
            settings: dto.settings,
        });

        const createdTenant = await this.tenantRepository.create(tenant);
        return createdTenant.toPrimitives();
    }
}
