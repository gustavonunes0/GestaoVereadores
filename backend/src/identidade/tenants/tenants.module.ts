import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { CreateTenantPaymentUseCase } from './application/use-cases/create-tenant-payment.use-case';
import { CreateTenantUseCase } from './application/use-cases/create-tenant.use-case';
import { DeleteTenantPaymentUseCase } from './application/use-cases/delete-tenant-payment.use-case';
import { DeleteTenantUseCase } from './application/use-cases/delete-tenant.use-case';
import { FindAllTenantsUseCase } from './application/use-cases/find-all-tenants.use-case';
import { FindTenantByIdUseCase } from './application/use-cases/find-tenant-by-id.use-case';
import { GetTenantDetailUseCase } from './application/use-cases/get-tenant-detail.use-case';
import { ListTenantPaymentsUseCase } from './application/use-cases/list-tenant-payments.use-case';
import { ListTenantsWithStatsUseCase } from './application/use-cases/list-tenants-with-stats.use-case';
import { ProvisionTenantUseCase } from './application/use-cases/provision-tenant.use-case';
import { UpdateTenantPaymentUseCase } from './application/use-cases/update-tenant-payment.use-case';
import { UpdateTenantUseCase } from './application/use-cases/update-tenant.use-case';
import { ResolveTenantByHostUseCase } from './application/use-cases/resolve-tenant-by-host.use-case';
import { PrismaTenantRepository } from './infra/database/prisma-tenant.repository';
import { TenantsController } from './infra/controllers/tenants.controller';
import { TenantHostController } from './infra/controllers/tenant-host.controller';
import { TENANT_REPOSITORY } from './tenants.tokens';

@Module({
    imports: [PrismaModule, UsersModule],
    controllers: [TenantHostController, TenantsController],
    providers: [
        CreateTenantUseCase,
        ProvisionTenantUseCase,
        FindAllTenantsUseCase,
        FindTenantByIdUseCase,
        ListTenantsWithStatsUseCase,
        GetTenantDetailUseCase,
        UpdateTenantUseCase,
        DeleteTenantUseCase,
        ListTenantPaymentsUseCase,
        CreateTenantPaymentUseCase,
        UpdateTenantPaymentUseCase,
        DeleteTenantPaymentUseCase,
        ResolveTenantByHostUseCase,
        PrismaTenantRepository,
        {
            provide: TENANT_REPOSITORY,
            useExisting: PrismaTenantRepository,
        },
    ],
    exports: [TENANT_REPOSITORY, ResolveTenantByHostUseCase],
})
export class TenantsModule {}
