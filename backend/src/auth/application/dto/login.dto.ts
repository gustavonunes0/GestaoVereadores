import {
    IsOptional,
    IsString,
    IsUUID,
    Matches,
    MinLength,
    ValidateIf,
} from 'class-validator';

export class LoginDto {
    @ValidateIf((o: LoginDto) => !o.cpf)
    @IsString()
    @MinLength(1)
    username?: string;

    @ValidateIf((o: LoginDto) => !o.username)
    @IsString()
    @Matches(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/)
    cpf?: string;

    @IsString()
    @MinLength(1)
    password: string;

    /** Câmara ativa no contexto do token (claim `tid`). Obrigatório para rotas legislativas. */
    @IsOptional()
    @IsUUID()
    tenantId?: string;
}
