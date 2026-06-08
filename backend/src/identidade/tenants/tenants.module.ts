import { Module } from '@nestjs/common';
import { CreateTenantUseCase } from './application/use-cases/create-tenant.use-case';
import { DeleteTenantUseCase } from './application/use-cases/delete-tenant.use-case';
import { FindAllTenantsUseCase } from './application/use-cases/find-all-tenants.use-case';
import { FindTenantByIdUseCase } from './application/use-cases/find-tenant-by-id.use-case';
import { UpdateTenantUseCase } from './application/use-cases/update-tenant.use-case';
import { PrismaTenantRepository } from './infra/database/prisma-tenant.repository';
import { TenantsController } from './infra/controllers/tenants.controller';
import { TENANT_REPOSITORY } from './tenants.tokens';

@Module({
    controllers: [TenantsController],
    providers: [
        CreateTenantUseCase,
        FindAllTenantsUseCase,
        FindTenantByIdUseCase,
        UpdateTenantUseCase,
        DeleteTenantUseCase,
        PrismaTenantRepository,
        {
            provide: TENANT_REPOSITORY,
            useExisting: PrismaTenantRepository,
        },
    ],
    exports: [TENANT_REPOSITORY],
})
export class TenantsModule {}
