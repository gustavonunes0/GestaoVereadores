import { PedidoPalavraEntity, StatusPedidoPalavra } from '../entities/pedido-palavra.entity';

export type CreatePedidoPalavraData = {
    sessaoId: string;
    parliamentarianId: string;
};

export type UpdatePedidoData = {
    respondidoEm?: Date;
    encerradoEm?: Date;
    duracaoSegundos?: number;
};

export abstract class PedidoPalavraRepository {
    abstract create(dados: CreatePedidoPalavraData): Promise<PedidoPalavraEntity>;
    abstract findById(id: string, tenantId: string): Promise<PedidoPalavraEntity | null>;
    abstract findAtivo(sessaoId: string, parliamentarianId: string): Promise<PedidoPalavraEntity | null>;
    abstract findFila(sessaoId: string, tenantId: string): Promise<PedidoPalavraEntity[]>;
    abstract updateStatus(id: string, status: StatusPedidoPalavra, dados?: UpdatePedidoData): Promise<PedidoPalavraEntity>;
}
