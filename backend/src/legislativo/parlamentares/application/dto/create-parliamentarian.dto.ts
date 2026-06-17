import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    Matches,
    MinLength,
} from 'class-validator';

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

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    biography?: string;
}
