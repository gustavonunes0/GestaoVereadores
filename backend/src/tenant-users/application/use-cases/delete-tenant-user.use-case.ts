import { Inject, Injectable } from '@nestjs/common';
import { TenantUserRepository } from '../../domain/tenant-user.repository';
import { TENANT_USER_REPOSITORY } from '../../tenant-users.tokens';
import { TenantUserNotFoundError } from '../errors/tenant-user-not-found.error';

@Injectable()
export class DeleteTenantUserUseCase {
    constructor(
        @Inject(TENANT_USER_REPOSITORY)
        private readonly tenantUserRepository: TenantUserRepository,
    ) {}

    async execute(id: string): Promise<void> {
        const tenantUser = await this.tenantUserRepository.findById(id);
        if (!tenantUser) {
            throw new TenantUserNotFoundError(id);
        }

        tenantUser.remove();
        await this.tenantUserRepository.update(tenantUser);
    }
}
