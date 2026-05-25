import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateSessaoPlenariaDto {
  @IsDateString()
  dataInicio: string;

  @IsString()
  tipoSessaoId: string;

  @IsString()
  situacaoId: string;

  @IsOptional()
  @IsString()
  sessaoLegislativaId?: string;

  @IsOptional()
  @IsString()
  mensagem?: string;
}

export class FilterSessaoPlenariaDto {
  @IsOptional()
  @IsString()
  tipoSessaoId?: string;

  @IsOptional()
  @IsString()
  situacaoId?: string;

  @IsOptional()
  @IsString()
  sessaoLegislativaId?: string;

  @IsOptional()
  @IsDateString()
  dataInicioDe?: string;

  @IsOptional()
  @IsDateString()
  dataInicioAte?: string;
}

export class AddPautaItemDto {
  @IsString()
  materiaId: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  ordem: number;
}

export class RegistrarPresencaDto {
  @IsString()
  parlamentarId: string;

  @IsOptional()
  @IsBoolean()
  presente?: boolean;
}
