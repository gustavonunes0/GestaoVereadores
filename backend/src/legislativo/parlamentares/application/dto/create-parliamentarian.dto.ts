import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsEmail,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    Matches,
    Max,
    Min,
    MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateParliamentarianDto {
    @ApiProperty({ example: '123.456.789-09' })
    @IsString()
    @Matches(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, {
        message: 'CPF inválido',
    })
    cpf: string;

    @ApiProperty({ minLength: 8 })
    @IsString()
    @MinLength(8, { message: 'Senha deve ter ao menos 8 caracteres' })
    password: string;

    @ApiPropertyOptional({ example: 'vereador@camara.gov.br' })
    @IsOptional()
    @IsEmail({}, { message: 'E-mail inválido' })
    email?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    politicalPartyId?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    parliamentaryName: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    officeNumber?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    photoUrl?: string;

    @ApiPropertyOptional({ description: 'Ponto focal X (0–100)' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @Max(100)
    photoPosX?: number;

    @ApiPropertyOptional({ description: 'Ponto focal Y (0–100)' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @Max(100)
    photoPosY?: number;

    @ApiPropertyOptional({ description: 'Zoom do enquadramento (0.85–2.5)' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0.85)
    @Max(2.5)
    photoZoom?: number;

    @ApiPropertyOptional({ description: 'Confirmação do enquadramento' })
    @IsOptional()
    @IsBoolean()
    photoPositionConfirmed?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    biography?: string;
}
