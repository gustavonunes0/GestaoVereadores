import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { PEDIDO_PALAVRA_REPOSITORY } from '../../sessoes-plenarias.tokens';
import { PedidoPalavraRepository } from '../../domain/repositories/pedido-palavra.repository';
import { SessaoRealtimeGateway } from '../../realtime/sessao-realtime.gateway';
import { PedidoPalavraViewModel } from '../view-models/pedido-palavra.view-model';

@Injectable()
export class EncerrarPedidoPalavraUseCase {
    constructor(
        @Inject(PEDIDO_PALAVRA_REPOSITORY)
        private readonly pedidoRepo: PedidoPalavraRepository,
        private readonly prisma: PrismaService,
        private readonly gateway: SessaoRealtimeGateway,
    ) {}

    async execute(pedidoId: string, tenantId: string) {
        const pedido = await this.pedidoRepo.findById(pedidoId, tenantId);
        if (!pedido || pedido.status !== 'CONCEDIDO') {
            throw new ConflictException('Pedido não está com a palavra concedida');
        }

        const parlamentar = await this.prisma.parliamentarian.findUnique({
            where: { id: pedido.parliamentarianId },
            select: { parliamentaryName: true },
        });
        const parlamentarNome = parlamentar?.parliamentaryName ?? '';

        const encerradoEm = new Date();
        const duracaoSegundos = pedido.respondidoEm
            ? Math.floor((encerradoEm.getTime() - pedido.respondidoEm.getTime()) / 1000)
            : undefined;

        const atualizado = await this.pedidoRepo.updateStatus(pedidoId, 'ENCERRADO', {
            encerradoEm,
            duracaoSegundos,
        });

        this.gateway.emitirPalavraEncerrada(tenantId, {
            pedidoId,
            parlamentarNome,
            sessaoId: pedido.sessaoId,
        });

        return PedidoPalavraViewModel.toHttp(atualizado, parlamentarNome);
    }
}
