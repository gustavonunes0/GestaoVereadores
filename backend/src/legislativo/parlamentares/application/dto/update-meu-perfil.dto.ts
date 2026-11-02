import {
    IsBoolean,
    IsEmail,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
    Max,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateMeuPerfilDto {
    @IsOptional() @IsString() @MinLength(3) @MaxLength(100)
    parliamentaryName?: string;

    @IsOptional() @IsUrl()
    photoUrl?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @Max(100)
    photoPosX?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @Max(100)
    photoPosY?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(2.5)
    photoZoom?: number;

    @IsOptional()
    @IsBoolean()
    photoPositionConfirmed?: boolean;

    @IsOptional() @IsEmail()
    email?: string;

    @IsOptional() @IsString() @MaxLength(20)
    telefone?: string;

    @IsOptional() @IsString() @MaxLength(100)
    gabinete?: string;
}
