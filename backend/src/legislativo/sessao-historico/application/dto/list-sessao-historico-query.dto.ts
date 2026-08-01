import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination.dto';
import { TipoEventoSessaoHistorico } from '../../domain/enums/tipo-evento-sessao-historico.enum';

export class ListSessaoHistoricoQueryDto extends PaginationQueryDto {
    @IsOptional()
    @IsEnum(TipoEventoSessaoHistorico)
    tipoEvento?: TipoEventoSessaoHistorico;
}
