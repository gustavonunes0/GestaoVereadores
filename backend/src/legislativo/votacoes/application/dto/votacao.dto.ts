import { TipoVotacao, Voto } from '@prisma/client';
import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsOptional,
    IsUUID,
    Min,
    ValidateIf,
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
    /** Modelo legado (Parlamentar). */
    @ValidateIf((o: RegistrarVotoDto) => !o.parliamentarianId)
    @IsUUID()
    parlamentarId?: string;

    /** Modelo novo (Parliamentarian) — app parlamentar. */
    @ValidateIf((o: RegistrarVotoDto) => !o.parlamentarId)
    @IsUUID()
    parliamentarianId?: string;

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
