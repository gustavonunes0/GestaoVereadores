import { Inject, Injectable } from '@nestjs/common';
import { TenantUserRepository } from '../../domain/repositories/tenant-user.repository';
import { TENANT_USER_REPOSITORY } from '../../tenant-users.tokens';
import { TenantUserNotFoundError } from '../errors/tenant-user-not-found.error';
import { TenantUserViewModel } from '../view-models/tenant-user.view-model';

@Injectable()
export class GetTenantUserByIdUseCase {
    constructor(
        @Inject(TENANT_USER_REPOSITORY)
        private readonly tenantUserRepository: TenantUserRepository,
    ) {}

    async execute(id: string) {
        const tenantUser = await this.tenantUserRepository.findById(id);
        if (!tenantUser) {
            throw new TenantUserNotFoundError(id);
        }

        return TenantUserViewModel.toHttpAdmin(tenantUser);
    }
}
