import { IsDateString, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class CreateAtoDto {
  @IsString()
  tipoId: string;

  @IsString()
  classificacaoId: string;

  @IsString()
  numero: string;

  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @IsOptional()
  @IsDateString()
  dataFim?: string;
}

export class FilterAtoDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  tipoId?: string;

  @IsOptional()
  @IsString()
  classificacaoId?: string;
}
