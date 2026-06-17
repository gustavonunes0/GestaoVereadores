import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsEmail,
    IsObject,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    ValidateNested,
} from 'class-validator';
import { PortalSecoes } from '../../domain/types/portal-settings.types';

class PortalSecoesDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    vereadores?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    mesaDiretora?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    comissoes?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    agenda?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    normas?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    materias?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    transmissao?: boolean;
}

class PortalRedesSociaisDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    facebook?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    instagram?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    youtube?: string;
}

class PortalCoresDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    primaria?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    secundaria?: string;
}

class PortalSettingsDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    ativo?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(200)
    titulo?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(300)
    subtitulo?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    sobre?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    endereco?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    telefone?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => PortalRedesSociaisDto)
    redesSociais?: PortalRedesSociaisDto;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => PortalCoresDto)
    cores?: PortalCoresDto;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    bannerUrl?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => PortalSecoesDto)
    secoes?: PortalSecoesDto;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    legislaturaId?: string;
}

export class UpdatePortalConfigDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(60)
    portalSlug?: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => PortalSettingsDto)
    portal?: PortalSettingsDto;
}

export type { PortalSecoes };
