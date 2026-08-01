import { FaseSessao } from '../enums/fase-sessao.enum';

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
    tema?: string;
    fase?: FaseSessao;
    tempoConcedidoSegundos?: number;

    estaAtivo(): boolean {
        return this.status === 'AGUARDANDO' || this.status === 'CONCEDIDO';
    }
}
