import { Module } from '@nestjs/common';
import { TenantsModule } from '../tenants/tenants.module';
import { UsersModule } from '../users/users.module';
import { CreateTenantUserUseCase } from './application/use-cases/create-tenant-user.use-case';
import { DeleteTenantUserUseCase } from './application/use-cases/delete-tenant-user.use-case';
import { FindAllTenantUsersUseCase } from './application/use-cases/find-all-tenant-users.use-case';
import { FindTenantUserByIdUseCase } from './application/use-cases/find-tenant-user-by-id.use-case';
import { UpdateTenantUserUseCase } from './application/use-cases/update-tenant-user.use-case';
import { TenantUsersController } from './infra/controllers/tenant-users.controller';
import { PrismaTenantUserRepository } from './infra/database/prisma-tenant-user.repository';
import { TENANT_USER_REPOSITORY } from './tenant-users.tokens';

@Module({
    imports: [UsersModule, TenantsModule],
    controllers: [TenantUsersController],
    providers: [
        CreateTenantUserUseCase,
        FindAllTenantUsersUseCase,
        FindTenantUserByIdUseCase,
        UpdateTenantUserUseCase,
        DeleteTenantUserUseCase,
        PrismaTenantUserRepository,
        {
            provide: TENANT_USER_REPOSITORY,
            useExisting: PrismaTenantUserRepository,
        },
    ],
    exports: [TENANT_USER_REPOSITORY],
})
export class TenantUsersModule {}
