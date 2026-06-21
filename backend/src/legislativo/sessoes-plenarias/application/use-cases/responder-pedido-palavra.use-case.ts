import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { PEDIDO_PALAVRA_REPOSITORY } from '../../sessoes-plenarias.tokens';
import { PedidoPalavraRepository } from '../../domain/repositories/pedido-palavra.repository';
import { SessaoRealtimeGateway } from '../../realtime/sessao-realtime.gateway';
import { PedidoPalavraViewModel } from '../view-models/pedido-palavra.view-model';

@Injectable()
export class ResponderPedidoPalavraUseCase {
    constructor(
        @Inject(PEDIDO_PALAVRA_REPOSITORY)
        private readonly pedidoRepo: PedidoPalavraRepository,
        private readonly prisma: PrismaService,
        private readonly gateway: SessaoRealtimeGateway,
    ) {}

    async execute(pedidoId: string, novoStatus: 'CONCEDIDO' | 'NEGADO', tenantId: string) {
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

        return PedidoPalavraViewModel.toHttp(atualizado, parlamentarNome);
    }
}
