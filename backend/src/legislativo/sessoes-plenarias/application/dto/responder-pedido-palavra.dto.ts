import { IsIn } from 'class-validator';

export class ResponderPedidoPalavraDto {
    @IsIn(['CONCEDIDO', 'NEGADO'])
    status: 'CONCEDIDO' | 'NEGADO';
}
