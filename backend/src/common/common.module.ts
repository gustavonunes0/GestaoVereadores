import { Global, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaExceptionFilter } from './filters/prisma-exception.filter';
import { TenantGuard } from './guards/tenant.guard';
import { TenantMaintainerGuard } from './guards/tenant-maintainer.guard';
import { TenantRolesGuard } from './guards/tenant-roles.guard';

@Global()
@Module({
    imports: [PrismaModule],
    providers: [
        { provide: APP_FILTER, useClass: PrismaExceptionFilter },
        TenantGuard,
        TenantRolesGuard,
        TenantMaintainerGuard,
    ],
    exports: [TenantGuard, TenantRolesGuard, TenantMaintainerGuard],
})
export class CommonModule {}
