import { ApiPropertyOptional } from '@nestjs/swagger';
import { TipoEventoAgenda } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination.dto';

export class CreateAgendaDto {
    @ApiPropertyOptional({ enum: TipoEventoAgenda })
    @IsOptional()
    @IsEnum(TipoEventoAgenda)
    tipo?: TipoEventoAgenda;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    numero?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    titulo?: string;

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
    @IsString()
    mensagem?: string;
}

export class UpdateAgendaDto extends CreateAgendaDto {}

export class FilterAgendaDto extends PaginationQueryDto {
    @ApiPropertyOptional({ enum: TipoEventoAgenda })
    @IsOptional()
    @IsEnum(TipoEventoAgenda)
    tipo?: TipoEventoAgenda;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    dataInicioDe?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    dataInicioAte?: string;
}
