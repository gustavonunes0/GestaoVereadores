export type StatusPedidoPalavra = 'AGUARDANDO' | 'CONCEDIDO' | 'NEGADO' | 'ENCERRADO';

export class PedidoPalavraEntity {
    id: string;
    sessaoId: string;
    parliamentarianId: string;
    status: StatusPedidoPalavra;
    criadoEm: Date;
    respondidoEm?: Date;
    encerradoEm?: Date;
    duracaoSegundos?: number;

    estaAtivo(): boolean {
        return this.status === 'AGUARDANDO' || this.status === 'CONCEDIDO';
    }
}
