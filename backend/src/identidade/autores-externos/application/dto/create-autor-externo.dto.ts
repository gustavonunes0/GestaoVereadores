import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEmail,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateAutorExternoDto {
    @ApiProperty()
    @IsUUID()
    tipoAutorId: string;

    @ApiProperty()
    @IsString()
    @MinLength(2)
    @MaxLength(200)
    nome: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(120)
    cargo?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(200)
    instituicao?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(14)
    cpf?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail()
    @MaxLength(200)
    email?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(30)
    telefone?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(80)
    registro?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(20)
    partido?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(2)
    uf?: string;
}
