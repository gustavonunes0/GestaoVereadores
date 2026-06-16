import { StatusMateria } from '@prisma/client';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    MinLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination.dto';

export class CreateMateriaDto {
    @IsString()
    tipoId: string;

    @IsString()
    @MinLength(3)
    ementa: string;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    numero?: number;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    numeroProtocolo?: number;

    @IsOptional()
    @IsString()
    anoId?: string;

    @IsOptional()
    @IsString()
    tematicaId?: string;

    @IsOptional()
    @IsString()
    origemId?: string;

    @IsOptional()
    @IsString()
    tipoListagemId?: string;

    @IsOptional()
    @IsDateString()
    dataApresentacaoInicio?: string;

    @IsOptional()
    @IsDateString()
    dataApresentacaoFim?: string;

    @IsOptional()
    @IsString()
    autorId?: string;

    @IsOptional()
    @IsString()
    authorParliamentarianId?: string;

    @IsOptional()
    @IsString()
    primeiroAutorId?: string;

    @IsOptional()
    @IsString()
    relatorId?: string;

    @IsOptional()
    @IsString()
    localOrigemExternaId?: string;

    @IsOptional()
    @IsString()
    unidadeTramitacaoDestinoId?: string;

    @IsOptional()
    @IsString()
    statusTramitacaoId?: string;

    @IsOptional()
    @IsBoolean()
    emTramitacao?: boolean;

    @IsOptional()
    @IsEnum(StatusMateria)
    status?: StatusMateria;

    @IsOptional()
    @IsString()
    mensagem?: string;

    /** Vereadores representantes (Moção, Requerimento). */
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    representanteIds?: string[];

    /** Coautores — Projeto de Lei (vereadores). */
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    coautorIds?: string[];

    /** Relatores — `autorId` com papel=RELATOR para cada entrada. */
    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    relatoresIds?: string[];
}

export class FilterMateriaDto extends PaginationQueryDto {
    @IsOptional()
    @IsString()
    tipoId?: string;

    @IsOptional()
    @IsString()
    anoId?: string;

    @IsOptional()
    @IsString()
    tematicaId?: string;

    @IsOptional()
    @IsString()
    autorId?: string;

    @IsOptional()
    @IsString()
    relatorId?: string;

    @IsOptional()
    @IsString()
    statusTramitacaoId?: string;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    emTramitacao?: boolean;

    @IsOptional()
    @IsEnum(StatusMateria)
    status?: StatusMateria;

    @IsOptional()
    @IsString()
    ementa?: string;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    numero?: number;
}
