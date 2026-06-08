import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination.dto';

export class ListAtosQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    tipoId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    classificacaoId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    numero?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    dataPublicacaoDe?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    dataPublicacaoAte?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    dataInicioDe?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    dataInicioAte?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    dataFimDe?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    dataFimAte?: string;
}
