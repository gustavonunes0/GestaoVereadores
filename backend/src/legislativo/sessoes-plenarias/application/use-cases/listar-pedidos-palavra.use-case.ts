import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { PEDIDO_PALAVRA_REPOSITORY } from '../../sessoes-plenarias.tokens';
import { PedidoPalavraRepository } from '../../domain/repositories/pedido-palavra.repository';
import { PedidoPalavraViewModel } from '../view-models/pedido-palavra.view-model';

@Injectable()
export class ListarPedidosPalavraUseCase {
    constructor(
        @Inject(PEDIDO_PALAVRA_REPOSITORY)
        private readonly pedidoRepo: PedidoPalavraRepository,
        private readonly prisma: PrismaService,
    ) {}

    async execute(sessaoId: string, tenantId: string) {
        const pedidos = await this.pedidoRepo.findFila(sessaoId, tenantId);

        const parliamentarianIds = [...new Set(pedidos.map(p => p.parliamentarianId))];
        const parlamentares = await this.prisma.parliamentarian.findMany({
            where: { id: { in: parliamentarianIds } },
            select: { id: true, parliamentaryName: true },
        });
        const nomeMap = new Map(parlamentares.map(p => [p.id, p.parliamentaryName]));

        return pedidos.map(p => PedidoPalavraViewModel.toHttp(p, nomeMap.get(p.parliamentarianId) ?? ''));
    }
}
