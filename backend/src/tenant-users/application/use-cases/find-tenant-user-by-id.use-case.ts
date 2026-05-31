import { Inject, Injectable } from '@nestjs/common';
import { TenantUserPrimitives } from '../../domain/tenant-user.entity';
import { TenantUserRepository } from '../../domain/tenant-user.repository';
import { TENANT_USER_REPOSITORY } from '../../tenant-users.tokens';
import { TenantUserNotFoundError } from '../errors/tenant-user-not-found.error';

@Injectable()
export class FindTenantUserByIdUseCase {
    constructor(
        @Inject(TENANT_USER_REPOSITORY)
        private readonly tenantUserRepository: TenantUserRepository,
    ) {}

    async execute(id: string): Promise<TenantUserPrimitives> {
        const tenantUser = await this.tenantUserRepository.findById(id);
        if (!tenantUser) {
            throw new TenantUserNotFoundError(id);
        }

        return tenantUser.toPrimitives();
    }
}
