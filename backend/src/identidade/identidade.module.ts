import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TenantUsersModule } from './tenant-users/tenant-users.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { UserManagerModule } from './user-manager/user-manager.module';
import { TenantPartnersModule } from './tenant-partners/tenant-partners.module';

@Module({
    imports: [
        PrismaModule,
        UsersModule,
        TenantsModule,
        TenantUsersModule,
        UserManagerModule,
        TenantPartnersModule,
    ],
    exports: [
        UsersModule,
        TenantsModule,
        TenantUsersModule,
        TenantPartnersModule,
    ],
})
export class IdentidadeModule {}
