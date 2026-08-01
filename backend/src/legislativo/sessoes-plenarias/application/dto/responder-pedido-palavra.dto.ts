import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class ResponderPedidoPalavraDto {
    @IsIn(['CONCEDIDO', 'NEGADO'])
    status: 'CONCEDIDO' | 'NEGADO';

    /** Tempo concedido pelo presidente, em segundos — usado para o cronômetro no painel. */
    @IsOptional()
    @IsInt()
    @Min(1)
    tempoConcedidoSegundos?: number;
}
