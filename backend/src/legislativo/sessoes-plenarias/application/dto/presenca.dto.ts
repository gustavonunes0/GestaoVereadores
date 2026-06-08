import { SituacaoPresenca } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { RegistrarPresencaDto } from './sessao.dto';

export class UpdatePresencaDto {
    @IsOptional()
    presente?: boolean;

    @IsOptional()
    @IsEnum(SituacaoPresenca)
    situacao?: SituacaoPresenca;

    @IsOptional()
    @IsString()
    justificativa?: string;
}

export class FilterPresencaDto {
    @IsOptional()
    @IsEnum(SituacaoPresenca)
    situacao?: SituacaoPresenca;

    @IsOptional()
    @IsUUID()
    parlamentarId?: string;
}

export { RegistrarPresencaDto };
