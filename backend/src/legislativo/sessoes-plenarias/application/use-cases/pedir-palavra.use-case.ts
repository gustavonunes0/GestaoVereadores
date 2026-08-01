import { ConflictException, Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ParlamentarianJwtPayload } from '../../../../auth/domain/types/jwt-payload.type';
import { PEDIDO_PALAVRA_REPOSITORY, SESSAO_PLENARIA_REPOSITORY } from '../../sessoes-plenarias.tokens';
import { SessaoPlenariaRepository } from '../../domain/repositories/sessao-plenaria.repository';
import { PedidoPalavraRepository } from '../../domain/repositories/pedido-palavra.repository';
import { SessaoRealtimeGateway } from '../../realtime/sessao-realtime.gateway';
import { PedidoPalavraViewModel } from '../view-models/pedido-palavra.view-model';
import { SessaoHistoricoRepository } from '../../../sessao-historico/domain/repositories/sessao-historico.repository';
import { TipoEventoSessaoHistorico } from '../../../sessao-historico/domain/enums/tipo-evento-sessao-historico.enum';
import { PedirPalavraDto } from '../dto/pedir-palavra.dto';

@Injectable()
export class PedirPalavraUseCase {
    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly sessaoRepo: SessaoPlenariaRepository,
        @Inject(PEDIDO_PALAVRA_REPOSITORY)
        private readonly pedidoRepo: PedidoPalavraRepository,
        private readonly prisma: PrismaService,
        private readonly gateway: SessaoRealtimeGateway,
        private readonly historicoRepository: SessaoHistoricoRepository,
    ) {}

    async execute(sessaoId: string, user: ParlamentarianJwtPayload, dto?: PedirPalavraDto) {
        const sessao = await this.sessaoRepo.findSessaoById(sessaoId, user.tenantId);
        if (!sessao || sessao.statusSessao !== 'ABERTA') {
            throw new UnprocessableEntityException('Pedido de palavra só é permitido em sessão aberta');
        }

        const presenca = await this.prisma.presencaSessao.findFirst({
            where: { sessaoId, parliamentarianId: user.parliamentarianId },
            select: { presente: true, situacao: true },
        });
        if (!presenca || presenca.situacao !== 'PRESENTE') {
            throw new UnprocessableEntityException('Você precisa estar marcado como presente para pedir a palavra');
        }

        const ativo = await this.pedidoRepo.findAtivo(sessaoId, user.parliamentarianId);
        if (ativo) {
            throw new ConflictException('Você já tem um pedido de palavra em andamento');
        }

        const pedido = await this.pedidoRepo.create({
            sessaoId,
            parliamentarianId: user.parliamentarianId,
            tema: dto?.tema,
            fase: sessao.faseAtual,
        });

        this.gateway.emitirPalavraPedida(user.tenantId, {
            pedidoId: pedido.id,
            parlamentarNome: user.parliamentaryName,
            sessaoId,
            criadoEm: pedido.criadoEm,
        });

        await this.historicoRepository.registrar({
            sessaoId,
            tipoEvento: TipoEventoSessaoHistorico.PEDIDO_PALAVRA_CRIADO,
            descricao: `${user.parliamentaryName} pediu a palavra`,
            metadata: { pedidoId: pedido.id, parliamentarianId: user.parliamentarianId },
        });

        return PedidoPalavraViewModel.toHttp(pedido, user.parliamentaryName);
    }
}
