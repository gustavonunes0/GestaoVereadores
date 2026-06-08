import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination.dto';

export class ListNormasQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    tipoId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    anoId?: string;

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
    numero?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    dataInicio?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    dataFim?: string;
}
