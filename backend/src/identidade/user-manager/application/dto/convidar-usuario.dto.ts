import { TenantUserRole } from '@prisma/client';
import {
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
    Matches,
    MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const STAFF_ROLES = [TenantUserRole.ADMIN_STAFF, TenantUserRole.STAFF] as const;

export class ConvidarUsuarioDto {
    @ApiProperty({ example: '529.982.247-25' })
    @IsString()
    @Matches(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, {
        message: 'CPF inválido',
    })
    cpf!: string;

    @ApiProperty({ minLength: 8 })
    @IsString()
    @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
    password!: string;

    @ApiProperty({ example: 'Maria Silva' })
    @IsString()
    @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
    nome!: string;

    @ApiPropertyOptional({ example: 'maria@camara.teste' })
    @IsOptional()
    @IsEmail({}, { message: 'E-mail inválido' })
    email?: string;

    @ApiProperty({ enum: STAFF_ROLES })
    @IsEnum(STAFF_ROLES, {
        message: 'Perfil deve ser ADMIN_STAFF ou STAFF',
    })
    role!: (typeof STAFF_ROLES)[number];
}
