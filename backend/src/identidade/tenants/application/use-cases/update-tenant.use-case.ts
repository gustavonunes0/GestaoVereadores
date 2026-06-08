import { Inject, Injectable } from '@nestjs/common';
import { TenantPrimitives } from '../../domain/tenant.entity';
import { TenantRepository } from '../../domain/tenant.repository';
import { TENANT_REPOSITORY } from '../../tenants.tokens';
import { UpdateTenantDto } from '../dtos/requests/update-tenant.request';
import { TenantCnpjAlreadyInUseError } from '../errors/tenant-cnpj-already-in-use.error';
import { TenantNotFoundError } from '../errors/tenant-not-found.error';

@Injectable()
export class UpdateTenantUseCase {
    constructor(
        @Inject(TENANT_REPOSITORY)
        private readonly tenantRepository: TenantRepository,
    ) {}

    async execute(id: string, dto: UpdateTenantDto): Promise<TenantPrimitives> {
        const tenant = await this.tenantRepository.findById(id);
        if (!tenant) {
            throw new TenantNotFoundError(id);
        }

        if (dto.cnpj) {
            const normalizedCnpj = dto.cnpj.replace(/\D/g, '');
            const tenantWithSameCnpj =
                await this.tenantRepository.findByCnpj(normalizedCnpj);
            if (tenantWithSameCnpj && tenantWithSameCnpj.id !== id) {
                throw new TenantCnpjAlreadyInUseError(normalizedCnpj);
            }
            dto.cnpj = normalizedCnpj;
        }

        tenant.update({
            name: dto.name,
            cnpj: dto.cnpj,
            logo: dto.logo,
            status: dto.status,
            settings: dto.settings,
        });

        const updatedTenant = await this.tenantRepository.update(tenant);
        return updatedTenant.toPrimitives();
    }
}
