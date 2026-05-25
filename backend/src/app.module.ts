import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
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
