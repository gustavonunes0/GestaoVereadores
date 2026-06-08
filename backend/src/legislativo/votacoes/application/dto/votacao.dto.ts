import { TipoVotacao, Voto } from '@prisma/client';
import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Min,
} from 'class-validator';

export class AbrirVotacaoDto {
    @IsEnum(TipoVotacao)
    tipoVotacao: TipoVotacao;

    /** Quando true (padrão), só parlamentares presentes podem votar. */
    @IsOptional()
    @IsBoolean()
    exigePresenca?: boolean;
}

export class RegistrarVotoDto {
    @IsString()
    parlamentarId: string;

    @IsEnum(Voto)
    voto: Voto;

    /** Perfil DDD (Parliamentarian); quando informado com legislatureProfileId, valida mandato ativo. */
    @IsOptional()
    @IsUUID()
    parliamentarianProfileId?: string;

    @IsOptional()
    @IsUUID()
    legislatureProfileId?: string;
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

export class VotacaoContextDto {
    @IsUUID()
    sessaoId: string;

    @IsUUID()
    pautaItemId: string;
}
