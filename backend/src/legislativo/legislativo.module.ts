import { Module } from '@nestjs/common';
import { AgendaLegislativaModule } from './agenda-legislativa/agenda-legislativa.module';
import { ComissoesModule } from './comissoes/comissoes.module';
import { FrentesParlamentaresModule } from './frentes-parlamentares/frentes-parlamentares.module';
import { LegislaturasModule } from './legislaturas/legislaturas.module';
import { MateriasModule } from './materias/materias.module';
import { MesaDiretoraModule } from './mesa-diretora/mesa-diretora.module';
import { ParlamentaresModule } from './parlamentares/parlamentares.module';
import { PartidosPoliticosModule } from './partidos-politicos/partidos-politicos.module';
import { SessoesPlenariasModule } from './sessoes-plenarias/sessoes-plenarias.module';
import { VotacoesModule } from './votacoes/votacoes.module';

@Module({
    imports: [
        PartidosPoliticosModule,
        ParlamentaresModule,
        LegislaturasModule,
        ComissoesModule,
        MesaDiretoraModule,
        FrentesParlamentaresModule,
        MateriasModule,
        SessoesPlenariasModule,
        VotacoesModule,
        AgendaLegislativaModule,
    ],
    exports: [PartidosPoliticosModule, ParlamentaresModule, LegislaturasModule],
})
export class LegislativoModule {}
