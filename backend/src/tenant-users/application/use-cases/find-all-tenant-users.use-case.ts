import { Inject, Injectable } from '@nestjs/common';
import { TenantUserPrimitives } from '../../domain/tenant-user.entity';
import { TenantUserRepository } from '../../domain/tenant-user.repository';
import { TENANT_USER_REPOSITORY } from '../../tenant-users.tokens';
import { ListTenantUsersDto } from '../dtos/requests/list-tenant-users.request';

@Injectable()
export class FindAllTenantUsersUseCase {
    constructor(
        @Inject(TENANT_USER_REPOSITORY)
        private readonly tenantUserRepository: TenantUserRepository,
    ) {}

    async execute(filters: ListTenantUsersDto): Promise<TenantUserPrimitives[]> {
        const tenantUsers = await this.tenantUserRepository.findAll(filters);
        return tenantUsers.map((tenantUser) => tenantUser.toPrimitives());
    }
}
