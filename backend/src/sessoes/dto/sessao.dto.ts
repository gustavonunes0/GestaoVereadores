import { FasePauta, ResultadoPauta, SituacaoPresenca } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

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

export class FilterSessaoPlenariaDto extends PaginationQueryDto {
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

  @IsOptional()
  @IsEnum(FasePauta)
  fase?: FasePauta;
}

export class RegistrarPresencaDto {
  @IsString()
  parlamentarId: string;

  @IsOptional()
  @IsBoolean()
  presente?: boolean;

  @IsOptional()
  @IsEnum(SituacaoPresenca)
  situacao?: SituacaoPresenca;

  @IsOptional()
  @IsString()
  justificativa?: string;
}

export class RegistrarResultadoPautaDto {
  @IsEnum(ResultadoPauta)
  resultado: ResultadoPauta;
}
