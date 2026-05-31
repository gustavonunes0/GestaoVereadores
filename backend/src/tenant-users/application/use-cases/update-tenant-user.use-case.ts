import { Inject, Injectable } from '@nestjs/common';
import { TenantUserPrimitives } from '../../domain/tenant-user.entity';
import { TenantUserRepository } from '../../domain/tenant-user.repository';
import { TENANT_USER_REPOSITORY } from '../../tenant-users.tokens';
import { UpdateTenantUserDto } from '../dtos/requests/update-tenant-user.request';
import { TenantUserNotFoundError } from '../errors/tenant-user-not-found.error';

@Injectable()
export class UpdateTenantUserUseCase {
    constructor(
        @Inject(TENANT_USER_REPOSITORY)
        private readonly tenantUserRepository: TenantUserRepository,
    ) {}

    async execute(
        id: string,
        dto: UpdateTenantUserDto,
    ): Promise<TenantUserPrimitives> {
        const tenantUser = await this.tenantUserRepository.findById(id);
        if (!tenantUser) {
            throw new TenantUserNotFoundError(id);
        }

        tenantUser.update({
            role: dto.role,
            status: dto.status,
            isAdmin: dto.isAdmin,
            permissions: dto.permissions,
        });

        const updatedTenantUser =
            await this.tenantUserRepository.update(tenantUser);
        return updatedTenantUser.toPrimitives();
    }
}
