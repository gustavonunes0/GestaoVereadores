import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { MateriasModule } from '../materias/materias.module';
import { ParlamentaresModule } from '../parlamentares/parlamentares.module';
import { VotacoesController } from './application/controllers/votacoes.controller';
import {
    ListResultadoValoresUseCase,
    PreviewResultadoVotacaoUseCase,
} from './application/use-cases/resultado.use-case';
import {
    AbrirVotacaoUseCase,
    FinalizarVotacaoUseCase,
    ListVotacaoTiposUseCase,
    ObterVotacaoUseCase,
} from './application/use-cases/votacao.use-case';
import {
    GetVotoByIdUseCase,
    ListVotoValoresUseCase,
    ListVotosUseCase,
    RegistrarVotoUseCase,
    UpdateVotoUseCase,
} from './application/use-cases/voto.use-case';
import { PrismaVotacaoRepository } from './infra/prisma/prisma-votacao.repository';
import { VOTACAO_REPOSITORY } from './votacoes.tokens';

@Module({
    imports: [PrismaModule, ParlamentaresModule, MateriasModule],
    controllers: [VotacoesController],
    providers: [
        AbrirVotacaoUseCase,
        ObterVotacaoUseCase,
        FinalizarVotacaoUseCase,
        ListVotacaoTiposUseCase,
        PreviewResultadoVotacaoUseCase,
        ListResultadoValoresUseCase,
        ListVotosUseCase,
        GetVotoByIdUseCase,
        RegistrarVotoUseCase,
        UpdateVotoUseCase,
        ListVotoValoresUseCase,
        PrismaVotacaoRepository,
        {
            provide: VOTACAO_REPOSITORY,
            useExisting: PrismaVotacaoRepository,
        },
    ],
    exports: [
        VOTACAO_REPOSITORY,
        AbrirVotacaoUseCase,
        ObterVotacaoUseCase,
        FinalizarVotacaoUseCase,
        ListVotacaoTiposUseCase,
        PreviewResultadoVotacaoUseCase,
        ListResultadoValoresUseCase,
        ListVotosUseCase,
        GetVotoByIdUseCase,
        RegistrarVotoUseCase,
        UpdateVotoUseCase,
        ListVotoValoresUseCase,
    ],
})
export class VotacoesModule {}
