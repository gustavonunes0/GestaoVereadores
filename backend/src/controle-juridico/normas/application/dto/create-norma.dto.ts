import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsDateString,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';

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
}
