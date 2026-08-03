import {
    IsOptional,
    IsString,
    IsUUID,
    Matches,
    MinLength,
} from 'class-validator';

export class LoginDto {
    @IsString()
    @Matches(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/)
    cpf: string;

    @IsString()
    @MinLength(1)
    password: string;

    /** Câmara ativa no contexto do token (claim `tenantId`). Obrigatório com múltiplos vínculos. */
    @IsOptional()
    @IsUUID()
    tenantId?: string;
}
