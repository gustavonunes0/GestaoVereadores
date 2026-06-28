import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
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
import { SetFaseSessaoUseCase } from './application/use-cases/set-fase-sessao.use-case';
import { RegistrarMinhaPresencaUseCase } from './application/use-cases/registrar-minha-presenca.use-case';
import { GetSessaoAtivaUseCase } from './application/use-cases/get-sessao-ativa.use-case';
import { PrismaSessaoPlenariaRepository } from './infra/prisma/prisma-sessao-plenaria.repository';
import { SESSAO_PLENARIA_REPOSITORY } from './sessoes-plenarias.tokens';
import { SessaoRealtimeGateway } from './realtime/sessao-realtime.gateway';
import { PresidenciaService } from './domain/services/presidencia.service';
import { PresidentOrStaffGuard } from '../../auth/guards/president-or-staff.guard';
import { PedirPalavraUseCase } from './application/use-cases/pedir-palavra.use-case';
import { ListarPedidosPalavraUseCase } from './application/use-cases/listar-pedidos-palavra.use-case';
import { ResponderPedidoPalavraUseCase } from './application/use-cases/responder-pedido-palavra.use-case';
import { GetJitsiTokenUseCase } from './application/use-cases/get-jitsi-token.use-case';
import { EncerrarPedidoPalavraUseCase } from './application/use-cases/encerrar-pedido-palavra.use-case';
import { PrismaPedidoPalavraRepository } from './infra/prisma/prisma-pedido-palavra.repository';
import { PedidoPalavraRepository } from './domain/repositories/pedido-palavra.repository';
import { PEDIDO_PALAVRA_REPOSITORY } from './sessoes-plenarias.tokens';

@Module({
    imports: [
        PrismaModule,
        ParlamentaresModule,
        MateriasModule,
        VotacoesModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.getOrThrow<string>('JWT_SECRET'),
            }),
        }),
    ],
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
        SetFaseSessaoUseCase,
        RegistrarMinhaPresencaUseCase,
        GetSessaoAtivaUseCase,
        SessaoRealtimeGateway,
        PresidenciaService,
        PresidentOrStaffGuard,
        PedirPalavraUseCase,
        ListarPedidosPalavraUseCase,
        ResponderPedidoPalavraUseCase,
        EncerrarPedidoPalavraUseCase,
        GetJitsiTokenUseCase,
        PrismaPedidoPalavraRepository,
        PrismaSessaoPlenariaRepository,
        {
            provide: SESSAO_PLENARIA_REPOSITORY,
            useExisting: PrismaSessaoPlenariaRepository,
        },
        {
            provide: PEDIDO_PALAVRA_REPOSITORY,
            useExisting: PrismaPedidoPalavraRepository,
        },
        {
            provide: PedidoPalavraRepository,
            useExisting: PrismaPedidoPalavraRepository,
        },
    ],
    exports: [SESSAO_PLENARIA_REPOSITORY, SessaoRealtimeGateway],
})
export class SessoesPlenariasModule {}
