import { Transform } from 'class-transformer';
import {
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    MinLength,
} from 'class-validator';

export class ProvisionTenantPartnerUserDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    nome: string;

    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) =>
        typeof value === 'string' ? value.replace(/\D/g, '') : value,
    )
    @Matches(/^\d{11}$/, { message: 'CPF do usuário deve conter 11 dígitos' })
    cpf: string;

    @IsOptional()
    @IsString()
    fotoPerfil?: string;
}
