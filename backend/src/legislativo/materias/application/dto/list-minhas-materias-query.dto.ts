import { StatusMateria } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class MinhasMateriasQueryDto {
    @IsOptional() @IsUUID()
    tipoId?: string;

    @IsOptional() @IsEnum(StatusMateria)
    status?: StatusMateria;

    @IsOptional() @IsDateString()
    dataInicio?: string;

    @IsOptional() @IsDateString()
    dataFim?: string;

    @IsOptional() @IsInt() @Min(1) @Type(() => Number)
    page?: number = 1;

    @IsOptional() @IsInt() @Min(1) @Max(50) @Type(() => Number)
    limit?: number = 20;
}
