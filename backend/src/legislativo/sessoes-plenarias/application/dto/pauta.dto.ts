import { FasePauta } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export class UpdatePautaItemDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    ordem?: number;

    @IsOptional()
    @IsEnum(FasePauta)
    fase?: FasePauta;
}

export class FilterPautaDto {
    @IsOptional()
    @IsEnum(FasePauta)
    fase?: FasePauta;
}
