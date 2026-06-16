import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsDate,
    IsInt,
    IsOptional,
    IsString,
    IsUrl,
    Min,
} from 'class-validator';

export class CreatePublicacaoDto {
    @ApiProperty()
    @Type(() => Date)
    @IsDate()
    dataPublicacao: Date;

    @ApiProperty()
    @IsString()
    veiculo: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Min(1)
    paginaInicio?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Min(1)
    paginaFim?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    identificador?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUrl()
    urlExterna?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    textoIntegral?: string;
}
