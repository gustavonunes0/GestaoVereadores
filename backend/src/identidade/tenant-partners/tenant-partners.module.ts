import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { TenantPartnersController } from './application/controllers/tenant-partners.controller';
import { CreateTenantPartnerUseCase } from './application/use-cases/create-tenant-partner.use-case';
import { ListTenantPartnersUseCase } from './application/use-cases/list-tenant-partners.use-case';
import { GetTenantPartnerByIdUseCase } from './application/use-cases/get-tenant-partner-by-id.use-case';
import { UpdateTenantPartnerUseCase } from './application/use-cases/update-tenant-partner.use-case';
import { RemoveTenantPartnerUseCase } from './application/use-cases/remove-tenant-partner.use-case';
import { ProvisionTenantPartnerUserUseCase } from './application/use-cases/provision-tenant-partner-user.use-case';
import { UpdateTenantPartnerUserUseCase } from './application/use-cases/update-tenant-partner-user.use-case';
import { RemoveTenantPartnerUserUseCase } from './application/use-cases/remove-tenant-partner-user.use-case';
import { PrismaTenantPartnerRepository } from './infra/prisma/prisma-tenant-partner.repository';
import { PrismaTenantPartnerUserRepository } from './infra/prisma/prisma-tenant-partner-user.repository';
import {
    TENANT_PARTNER_REPOSITORY,
    TENANT_PARTNER_USER_REPOSITORY,
} from './tenant-partners.tokens';

@Module({
    imports: [UsersModule],
    controllers: [TenantPartnersController],
    providers: [
        CreateTenantPartnerUseCase,
        ListTenantPartnersUseCase,
        GetTenantPartnerByIdUseCase,
        UpdateTenantPartnerUseCase,
        RemoveTenantPartnerUseCase,
        ProvisionTenantPartnerUserUseCase,
        UpdateTenantPartnerUserUseCase,
        RemoveTenantPartnerUserUseCase,
        PrismaTenantPartnerRepository,
        PrismaTenantPartnerUserRepository,
        {
            provide: TENANT_PARTNER_REPOSITORY,
            useExisting: PrismaTenantPartnerRepository,
        },
        {
            provide: TENANT_PARTNER_USER_REPOSITORY,
            useExisting: PrismaTenantPartnerUserRepository,
        },
    ],
    exports: [TENANT_PARTNER_REPOSITORY, TENANT_PARTNER_USER_REPOSITORY],
})
export class TenantPartnersModule {}
