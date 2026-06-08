import { Inject, Injectable } from '@nestjs/common';
import { TenantUserRepository } from '../../domain/repositories/tenant-user.repository';
import { TENANT_USER_REPOSITORY } from '../../tenant-users.tokens';
import { UpdateTenantUserDto } from '../dto/update-tenant-user.dto';
import { TenantUserNotFoundError } from '../errors/tenant-user-not-found.error';
import { TenantUserViewModel } from '../view-models/tenant-user.view-model';

@Injectable()
export class UpdateTenantUserUseCase {
    constructor(
        @Inject(TENANT_USER_REPOSITORY)
        private readonly tenantUserRepository: TenantUserRepository,
    ) {}

    async execute(id: string, dto: UpdateTenantUserDto) {
        const tenantUser = await this.tenantUserRepository.findById(id);
        if (!tenantUser) {
            throw new TenantUserNotFoundError(id);
        }

        tenantUser.update({
            isTenantAdmin: dto.isTenantAdmin,
            isTenantStaff: dto.isTenantStaff,
            isParliamentarian: dto.isParliamentarian,
            status: dto.status,
            permissions: dto.permissions,
        });

        const updated = await this.tenantUserRepository.update(tenantUser);
        return TenantUserViewModel.toHttpAdmin(updated);
    }
}
