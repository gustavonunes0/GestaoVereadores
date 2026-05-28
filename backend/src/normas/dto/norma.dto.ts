import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class CreateNormaDto {
  @IsString()
  tipoId: string;

  @IsString()
  numero: string;

  @IsString()
  @MinLength(3)
  ementa: string;

  @IsOptional()
  @IsString()
  anoId?: string;

  @IsOptional()
  @IsDateString()
  data?: string;

  @IsOptional()
  @IsString()
  esferaFederacaoId?: string;

  @IsOptional()
  @IsString()
  identificadorId?: string;

  @IsOptional()
  @IsString()
  materiaOrigemId?: string;
}

export class FilterNormaDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  tipoId?: string;

  @IsOptional()
  @IsString()
  anoId?: string;

  @IsOptional()
  @IsString()
  numero?: string;
}
