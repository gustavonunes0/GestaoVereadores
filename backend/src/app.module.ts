import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { TenantGuard } from './common/guards/tenant.guard';
import { TenantRolesGuard } from './common/guards/tenant-roles.guard';
import { CommonModule } from './common/common.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { ControleJuridicoModule } from './controle-juridico/controle-juridico.module';
import { AtosAdministrativosModule } from './atos-administrativos/atos-administrativos.module';
import { RelatoriosModule } from './relatorios/relatorios.module';
import { IdentidadeModule } from './identidade/identidade.module';
import { LegislativoModule } from './legislativo/legislativo.module';
import { DominiosModule } from './common/dominios/dominios.module';

@Module({
    providers: [
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: TenantGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
        { provide: APP_GUARD, useClass: TenantRolesGuard },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
    ],
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        CommonModule,
        AuthModule,
        HealthModule,
        PrismaModule,
        ControleJuridicoModule,
        AtosAdministrativosModule,
        RelatoriosModule,
        IdentidadeModule,
        LegislativoModule,
        DominiosModule,
    ],
})
export class AppModule {}
