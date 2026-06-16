import { ApiPropertyOptional } from '@nestjs/swagger';
import { TipoEventoAgenda } from '@prisma/client';
import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
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

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    local?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    descricao?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    sessaoPlenariaId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    publicoExterno?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    linkTransmissao?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    recorrencia?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    recorrenciaPaiId?: string;
}

export class UpdateAgendaDto extends CreateAgendaDto {}

export class VincularSessaoDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    sessaoPlenariaId?: string | null;
}

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
