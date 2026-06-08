import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GuestUsersModule } from './guest-users';
import { TenantUsersModule } from './tenant-users/tenant-users.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';

@Module({
    imports: [
        PrismaModule,
        UsersModule,
        TenantsModule,
        TenantUsersModule,
        GuestUsersModule,
    ],
    exports: [
        UsersModule,
        TenantsModule,
        TenantUsersModule,
        GuestUsersModule,
    ],
})
export class IdentidadeModule {}
