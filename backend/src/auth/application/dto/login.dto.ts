import {
    IsEmail,
    IsOptional,
    IsString,
    IsUUID,
    Matches,
    MinLength,
    ValidateIf,
} from 'class-validator';

export class LoginDto {
    @ValidateIf((o: LoginDto) => !o.email)
    @IsString()
    @Matches(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/)
    cpf?: string;

    @ValidateIf((o: LoginDto) => !o.cpf)
    @IsEmail()
    email?: string;

    @IsString()
    @MinLength(1)
    password: string;

    /** Câmara ativa no contexto do token (claim `tenantId`). Obrigatório com múltiplos vínculos. */
    @IsOptional()
    @IsUUID()
    tenantId?: string;
}
