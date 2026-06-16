import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class RegistrarSancaoDto {
    @ApiProperty()
    @IsDateString()
    dataSancao: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    textoUrl?: string;
}

export class RegistrarVetoDto {
    @ApiProperty()
    @IsDateString()
    dataVeto: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    tipoVeto?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    motivoVeto?: string;
}

export class RegistrarPromulgacaoDto {
    @ApiProperty()
    @IsDateString()
    dataPromulgacao: string;
}

export class RegistrarPublicacaoDto {
    @ApiProperty()
    @IsDateString()
    dataPublicacao: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    dataVigencia?: string;
}

export class RevogarNormaDto {
    @ApiProperty()
    @IsDateString()
    dataRevogacao: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    normaRevoganteId?: string;
}
