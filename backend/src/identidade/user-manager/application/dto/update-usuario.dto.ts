import { TenantUserRole } from '@prisma/client';
import {
    IsBoolean,
    IsEnum,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const STAFF_ROLES = [
    TenantUserRole.ADMIN_STAFF,
    TenantUserRole.STAFF,
    TenantUserRole.SECRETARIA_LEGISLATIVA,
] as const;

export class UpdateUsuarioDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
    nome?: string;

    @ApiPropertyOptional({ enum: STAFF_ROLES })
    @IsOptional()
    @IsEnum(STAFF_ROLES, {
        message:
            'Perfil deve ser ADMIN_STAFF, STAFF ou SECRETARIA_LEGISLATIVA',
    })
    role?: (typeof STAFF_ROLES)[number];

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    ativo?: boolean;

    @ApiPropertyOptional({ minLength: 8, description: 'Nova senha (opcional)' })
    @IsOptional()
    @IsString()
    @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
    password?: string;
}
