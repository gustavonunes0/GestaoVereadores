import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { AutoresModule } from './autores/autores.module';
import { CommonModule } from './common/common.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { ParlamentaresModule } from './parlamentares/parlamentares.module';
import { ComissoesModule } from './comissoes/comissoes.module';
import { FrentesModule } from './frentes/frentes.module';
import { LegislaturasModule } from './legislaturas/legislaturas.module';
import { SessoesModule } from './sessoes/sessoes.module';
import { MateriasModule } from './materias/materias.module';
import { NormasModule } from './normas/normas.module';
import { AtosModule } from './atos/atos.module';
import { MesaDiretoraModule } from './mesa-diretora/mesa-diretora.module';
import { RelatoriosModule } from './relatorios/relatorios.module';
import { DominiosModule } from './dominios/dominios.module';

@Module({
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    AuthModule,
    HealthModule,
    PrismaModule,
    AutoresModule,
    DominiosModule,
    ParlamentaresModule,
    ComissoesModule,
    FrentesModule,
    LegislaturasModule,
    SessoesModule,
    MateriasModule,
    NormasModule,
    AtosModule,
    MesaDiretoraModule,
    RelatoriosModule,
  ],
})
export class AppModule {}
