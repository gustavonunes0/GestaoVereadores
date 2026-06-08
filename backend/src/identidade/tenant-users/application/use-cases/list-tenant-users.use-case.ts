import { Inject, Injectable } from '@nestjs/common';
import { TenantUserRepository } from '../../domain/repositories/tenant-user.repository';
import { TENANT_USER_REPOSITORY } from '../../tenant-users.tokens';
import { ListTenantUsersQueryDto } from '../dto/list-tenant-users-query.dto';
import { TenantUserViewModel } from '../view-models/tenant-user.view-model';

@Injectable()
export class ListTenantUsersUseCase {
    constructor(
        @Inject(TENANT_USER_REPOSITORY)
        private readonly tenantUserRepository: TenantUserRepository,
    ) {}

    async execute(query: ListTenantUsersQueryDto) {
        const tenantUsers = await this.tenantUserRepository.findAll({
            tenantId: query.tenantId,
            userId: query.userId,
        });

        return tenantUsers.map((tu) => TenantUserViewModel.toHttpAdmin(tu));
    }
}
