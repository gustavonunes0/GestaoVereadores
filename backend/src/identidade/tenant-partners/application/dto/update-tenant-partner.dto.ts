import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateTenantPartnerDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    nome?: string;

    @IsOptional()
    @IsString()
    cargo?: string;

    @IsOptional()
    @IsString()
    instituicao?: string;

    @IsOptional()
    @IsString()
    cpf?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    telefone?: string;

    @IsOptional()
    @IsString()
    registro?: string;

    @IsOptional()
    @IsString()
    partido?: string;

    @IsOptional()
    @IsString()
    uf?: string;
}
