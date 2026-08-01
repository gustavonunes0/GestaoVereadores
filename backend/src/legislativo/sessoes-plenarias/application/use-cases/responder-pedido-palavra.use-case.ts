import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { PEDIDO_PALAVRA_REPOSITORY } from '../../sessoes-plenarias.tokens';
import { PedidoPalavraRepository } from '../../domain/repositories/pedido-palavra.repository';
import { SessaoRealtimeGateway } from '../../realtime/sessao-realtime.gateway';
import { PedidoPalavraViewModel } from '../view-models/pedido-palavra.view-model';
import { SessaoHistoricoRepository } from '../../../sessao-historico/domain/repositories/sessao-historico.repository';
import { TipoEventoSessaoHistorico } from '../../../sessao-historico/domain/enums/tipo-evento-sessao-historico.enum';

@Injectable()
export class ResponderPedidoPalavraUseCase {
    constructor(
        @Inject(PEDIDO_PALAVRA_REPOSITORY)
        private readonly pedidoRepo: PedidoPalavraRepository,
        private readonly prisma: PrismaService,
        private readonly gateway: SessaoRealtimeGateway,
        private readonly historicoRepository: SessaoHistoricoRepository,
    ) {}

    async execute(
        pedidoId: string,
        novoStatus: 'CONCEDIDO' | 'NEGADO',
        tenantId: string,
        tempoConcedidoSegundos?: number,
    ) {
        const pedido = await this.pedidoRepo.findById(pedidoId, tenantId);
        if (!pedido || pedido.status !== 'AGUARDANDO') {
            throw new ConflictException('Pedido não está aguardando resposta');
        }

        const parlamentar = await this.prisma.parliamentarian.findUnique({
            where: { id: pedido.parliamentarianId },
            select: { parliamentaryName: true },
        });
        const parlamentarNome = parlamentar?.parliamentaryName ?? '';

        const atualizado = await this.pedidoRepo.updateStatus(pedidoId, novoStatus, {
            respondidoEm: new Date(),
            ...(novoStatus === 'CONCEDIDO' && tempoConcedidoSegundos !== undefined
                ? { tempoConcedidoSegundos }
                : {}),
        });

        if (novoStatus === 'CONCEDIDO') {
            this.gateway.emitirPalavraConcedida(tenantId, {
                pedidoId,
                parlamentarNome,
                sessaoId: pedido.sessaoId,
            });
        } else {
            this.gateway.emitirPalavraNegada(pedido.parliamentarianId, {
                pedidoId,
                sessaoId: pedido.sessaoId,
            });
        }

        await this.historicoRepository.registrar({
            sessaoId: pedido.sessaoId,
            tipoEvento: TipoEventoSessaoHistorico.PEDIDO_PALAVRA_RESPONDIDO,
            descricao: `Pedido de palavra de ${parlamentarNome} — ${novoStatus}`,
            metadata: { pedidoId, novoStatus },
        });

        return PedidoPalavraViewModel.toHttp(atualizado, parlamentarNome);
    }
}
