import { PedidoPalavraEntity } from '../../domain/entities/pedido-palavra.entity';

export class PedidoPalavraViewModel {
    static toHttp(pedido: PedidoPalavraEntity, parlamentarNome: string) {
        return {
            id: pedido.id,
            sessaoId: pedido.sessaoId,
            parlamentarNome,
            status: pedido.status,
            criadoEm: pedido.criadoEm,
            respondidoEm: pedido.respondidoEm ?? null,
            encerradoEm: pedido.encerradoEm ?? null,
            duracaoSegundos: pedido.duracaoSegundos ?? null,
        };
    }
}
