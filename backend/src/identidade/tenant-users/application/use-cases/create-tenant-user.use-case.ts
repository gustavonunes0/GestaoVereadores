import { Inject, Injectable } from '@nestjs/common';
import { TenantRepository } from '../../../tenants/domain/tenant.repository';
import { TENANT_REPOSITORY } from '../../../tenants/tenants.tokens';
import { UserRepository } from '../../../users/domain/user.repository';
import { USER_REPOSITORY } from '../../../users/users.tokens';
import { TenantUserEntity } from '../../domain/entities/tenant-user.entity';
import { TenantUserRepository } from '../../domain/repositories/tenant-user.repository';
import { TENANT_USER_REPOSITORY } from '../../tenant-users.tokens';
import { CreateTenantUserDto } from '../dto/create-tenant-user.dto';
import { TenantUserAlreadyExistsError } from '../errors/tenant-user-already-exists.error';
import { TenantNotFoundError } from '../../../tenants/application/errors/tenant-not-found.error';
import { UserNotFoundError } from '../../../users/application/errors/user-not-found.error';
import { TenantUserViewModel } from '../view-models/tenant-user.view-model';

@Injectable()
export class CreateTenantUserUseCase {
    constructor(
        @Inject(TENANT_USER_REPOSITORY)
        private readonly tenantUserRepository: TenantUserRepository,
        @Inject(TENANT_REPOSITORY)
        private readonly tenantRepository: TenantRepository,
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
    ) {}

    async execute(dto: CreateTenantUserDto) {
        const tenant = await this.tenantRepository.findById(dto.tenantId);
        if (!tenant) {
            throw new TenantNotFoundError(dto.tenantId);
        }

        const user = await this.userRepository.findById(dto.userId);
        if (!user) {
            throw new UserNotFoundError(dto.userId);
        }

        const existingTenantUser =
            await this.tenantUserRepository.findByTenantAndUser(
                dto.tenantId,
                dto.userId,
            );
        if (existingTenantUser) {
            throw new TenantUserAlreadyExistsError(dto.tenantId, dto.userId);
        }

        const tenantUser = TenantUserEntity.create({
            tenantId: dto.tenantId,
            userId: dto.userId,
            isTenantAdmin: dto.isTenantAdmin,
            isTenantStaff: dto.isTenantStaff,
            isParliamentarian: dto.isParliamentarian,
            status: dto.status,
            permissions: dto.permissions,
        });

        const createdTenantUser =
            await this.tenantUserRepository.create(tenantUser);
        return TenantUserViewModel.toHttpAdmin(createdTenantUser);
    }
}
