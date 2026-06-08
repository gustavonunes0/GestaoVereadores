import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAtoDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    tipoId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    classificacaoId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    numero: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    dataInicio?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    dataFim?: string;

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
    mensagem?: string;
}
