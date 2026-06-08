import { Module } from '@nestjs/common';
import { TenantsModule } from '../tenants/tenants.module';
import { UsersModule } from '../users/users.module';
import { TenantUsersController } from './application/controllers/tenant-users.controller';
import { CreateTenantUserUseCase } from './application/use-cases/create-tenant-user.use-case';
import { GetTenantUserByIdUseCase } from './application/use-cases/get-tenant-user-by-id.use-case';
import { ListTenantUsersUseCase } from './application/use-cases/list-tenant-users.use-case';
import { RemoveTenantUserUseCase } from './application/use-cases/remove-tenant-user.use-case';
import { UpdateTenantUserUseCase } from './application/use-cases/update-tenant-user.use-case';
import { PrismaTenantUserRepository } from './infra/prisma/prisma-tenant-user.repository';
import { PrismaActiveParliamentarianChecker } from './infra/prisma/prisma-active-parliamentarian.checker';
import {
    ACTIVE_PARLIAMENTARIAN_CHECKER,
    TENANT_USER_REPOSITORY,
} from './tenant-users.tokens';

@Module({
    imports: [TenantsModule, UsersModule],
    controllers: [TenantUsersController],
    providers: [
        CreateTenantUserUseCase,
        ListTenantUsersUseCase,
        GetTenantUserByIdUseCase,
        UpdateTenantUserUseCase,
        RemoveTenantUserUseCase,
        PrismaTenantUserRepository,
        PrismaActiveParliamentarianChecker,
        {
            provide: TENANT_USER_REPOSITORY,
            useExisting: PrismaTenantUserRepository,
        },
        {
            provide: ACTIVE_PARLIAMENTARIAN_CHECKER,
            useExisting: PrismaActiveParliamentarianChecker,
        },
    ],
    exports: [TENANT_USER_REPOSITORY, ACTIVE_PARLIAMENTARIAN_CHECKER],
})
export class TenantUsersModule {}
