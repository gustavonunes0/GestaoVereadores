import { TipoVotacao, Voto } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class AbrirVotacaoDto {
  @IsEnum(TipoVotacao)
  tipoVotacao: TipoVotacao;
}

export class RegistrarVotoDto {
  @IsString()
  parlamentarId: string;

  @IsEnum(Voto)
  voto: Voto;
}

export class FinalizarVotacaoDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  votosSim?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  votosNao?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  abstencoes?: number;
}
