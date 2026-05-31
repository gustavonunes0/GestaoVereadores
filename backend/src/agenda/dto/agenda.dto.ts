import { IsDateString, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class CreateAgendaDto {
  @IsOptional()
  @IsString()
  numero?: string;

  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @IsOptional()
  @IsDateString()
  dataFim?: string;

  @IsOptional()
  @IsString()
  mensagem?: string;
}

export class UpdateAgendaDto extends CreateAgendaDto {}

export class FilterAgendaDto extends PaginationQueryDto {
  @IsOptional()
  @IsDateString()
  dataInicioDe?: string;

  @IsOptional()
  @IsDateString()
  dataInicioAte?: string;
}
