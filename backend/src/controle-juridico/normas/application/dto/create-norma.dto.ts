import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsDateString,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Max,
    Min,
    MinLength,
} from 'class-validator';

/** Limite de colunas INT4 no PostgreSQL. */
const PG_INT_MAX = 2_147_483_647;

export class CreateNormaDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    tipoId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    numero: string;

    @ApiProperty()
    @IsString()
    @MinLength(3)
    ementa: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    anoId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    data?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    dataPublicacaoInicio?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    dataPublicacaoFim?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    esferaFederacaoId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    identificadorId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    materiaOrigemId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    mensagem?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    complementar?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    dataPublicacao?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    veiculoPublicacao?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    urlExternaPublicacao?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt({ message: 'Página início deve ser um número inteiro.' })
    @Min(1, { message: 'Página início deve ser no mínimo 1.' })
    @Max(PG_INT_MAX, {
        message: 'Página início excede o valor máximo permitido.',
    })
    paginaInicio?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt({ message: 'Página fim deve ser um número inteiro.' })
    @Min(1, { message: 'Página fim deve ser no mínimo 1.' })
    @Max(PG_INT_MAX, {
        message: 'Página fim excede o valor máximo permitido.',
    })
    paginaFim?: number;
}
