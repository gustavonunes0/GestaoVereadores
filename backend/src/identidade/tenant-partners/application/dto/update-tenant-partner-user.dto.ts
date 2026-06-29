import { Transform } from 'class-transformer';
import {
    IsOptional,
    IsString,
    Matches,
    MinLength,
} from 'class-validator';

export class UpdateTenantPartnerUserDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    nome?: string;

    @IsOptional()
    @IsString()
    @Transform(({ value }) =>
        typeof value === 'string' ? value.replace(/\D/g, '') : value,
    )
    @Matches(/^\d{11}$/, { message: 'CPF do usuário deve conter 11 dígitos' })
    cpf?: string;

    @IsOptional()
    @IsString()
    fotoPerfil?: string;
}
