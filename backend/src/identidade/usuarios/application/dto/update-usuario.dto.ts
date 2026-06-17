import { TenantUserRole } from '@prisma/client';
import {
    IsBoolean,
    IsEnum,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const STAFF_ROLES = [TenantUserRole.ADMIN_STAFF, TenantUserRole.STAFF] as const;

export class UpdateUsuarioDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
    nome?: string;

    @ApiPropertyOptional({ enum: STAFF_ROLES })
    @IsOptional()
    @IsEnum(STAFF_ROLES, {
        message: 'Perfil deve ser ADMIN_STAFF ou STAFF',
    })
    role?: (typeof STAFF_ROLES)[number];

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    ativo?: boolean;
}
