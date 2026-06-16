import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { MateriasModule } from '../materias/materias.module';
import { ParlamentaresModule } from '../parlamentares/parlamentares.module';
import { VotacoesModule } from '../votacoes/votacoes.module';
import { SessoesController } from './application/controllers/sessoes.controller';
import { CreateSessaoPlenariaUseCase } from './application/use-cases/create-sessao-plenaria.use-case';
import { GetSessaoPlenariaByIdUseCase } from './application/use-cases/get-sessao-plenaria-by-id.use-case';
import { ListSessoesPlenariasUseCase } from './application/use-cases/list-sessoes-plenarias.use-case';
import {
    AddPautaItemUseCase,
    GetPautaItemByIdUseCase,
    ListPautaFasesUseCase,
    ListPautaItensUseCase,
    RemovePautaItemUseCase,
    UpdatePautaItemUseCase,
} from './application/use-cases/pauta.use-case';
import {
    GetPresencaByIdUseCase,
    ListPresencaSituacoesUseCase,
    ListPresencasUseCase,
    RegistrarPresencaUseCase,
    UpdatePresencaUseCase,
} from './application/use-cases/presenca.use-case';
import { RegistrarResultadoPautaUseCase } from './application/use-cases/registrar-resultado-pauta.use-case';
import {
    ExecuteSessionLifecycleUseCase,
    GetSessionWorkflowUseCase,
    ListSessionLifecycleActionsUseCase,
    ListSessionStatusesUseCase,
} from './application/use-cases/session-lifecycle.use-case';
import { RemoveSessaoPlenariaUseCase } from './application/use-cases/remove-sessao-plenaria.use-case';
import { UpdateSessaoPlenariaUseCase } from './application/use-cases/update-sessao-plenaria.use-case';
import { AbrirSessaoUseCase } from './application/use-cases/abrir-sessao.use-case';
import { SuspenderSessaoUseCase } from './application/use-cases/suspender-sessao.use-case';
import { EncerrarSessaoUseCase } from './application/use-cases/encerrar-sessao.use-case';
import { CancelarSessaoUseCase } from './application/use-cases/cancelar-sessao.use-case';
import { PublicarPautaUseCase } from './application/use-cases/publicar-pauta.use-case';
import { CalcularQuorumUseCase } from './application/use-cases/calcular-quorum.use-case';
import { PrismaSessaoPlenariaRepository } from './infra/prisma/prisma-sessao-plenaria.repository';
import { SESSAO_PLENARIA_REPOSITORY } from './sessoes-plenarias.tokens';

@Module({
    imports: [PrismaModule, ParlamentaresModule, MateriasModule, VotacoesModule],
    controllers: [SessoesController],
    providers: [
        CreateSessaoPlenariaUseCase,
        ListSessoesPlenariasUseCase,
        GetSessaoPlenariaByIdUseCase,
        ListSessionStatusesUseCase,
        GetSessionWorkflowUseCase,
        ExecuteSessionLifecycleUseCase,
        ListSessionLifecycleActionsUseCase,
        UpdateSessaoPlenariaUseCase,
        RemoveSessaoPlenariaUseCase,
        ListPautaItensUseCase,
        GetPautaItemByIdUseCase,
        ListPautaFasesUseCase,
        AddPautaItemUseCase,
        UpdatePautaItemUseCase,
        RemovePautaItemUseCase,
        RegistrarResultadoPautaUseCase,
        ListPresencasUseCase,
        GetPresencaByIdUseCase,
        ListPresencaSituacoesUseCase,
        RegistrarPresencaUseCase,
        UpdatePresencaUseCase,
        AbrirSessaoUseCase,
        SuspenderSessaoUseCase,
        EncerrarSessaoUseCase,
        CancelarSessaoUseCase,
        PublicarPautaUseCase,
        CalcularQuorumUseCase,
        PrismaSessaoPlenariaRepository,
        {
            provide: SESSAO_PLENARIA_REPOSITORY,
            useExisting: PrismaSessaoPlenariaRepository,
        },
    ],
    exports: [SESSAO_PLENARIA_REPOSITORY],
})
export class SessoesPlenariasModule {}
