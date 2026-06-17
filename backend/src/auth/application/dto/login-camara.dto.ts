import {
    IsEmail,
    IsOptional,
    IsString,
    IsUUID,
    Matches,
    MinLength,
    ValidateIf,
} from 'class-validator';

export class LoginCamaraDto {
    @ValidateIf((o: LoginCamaraDto) => !o.cpf)
    @IsEmail()
    email?: string;

    @ValidateIf((o: LoginCamaraDto) => !o.email)
    @IsString()
    @Matches(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/)
    cpf?: string;

    @IsString()
    @MinLength(8)
    password: string;

    /** CNPJ da câmara (com ou sem máscara). */
    @IsOptional()
    @IsString()
    tenantCnpj?: string;

    @IsOptional()
    @IsUUID()
    tenantId?: string;
}
