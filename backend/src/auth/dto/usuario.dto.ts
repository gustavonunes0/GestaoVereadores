import { RoleUsuario } from '@prisma/client';
import {
    IsBoolean,
    IsEnum,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';

export class CreateUsuarioDto {
    @IsString()
    @MinLength(3)
    username: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @MinLength(2)
    nome: string;

    @IsEnum(RoleUsuario)
    role: RoleUsuario;
}

export class UpdateUsuarioDto {
    @IsOptional()
    @IsString()
    @MinLength(2)
    nome?: string;

    @IsOptional()
    @IsEnum(RoleUsuario)
    role?: RoleUsuario;

    @IsOptional()
    @IsBoolean()
    ativo?: boolean;
}

export class ChangePasswordDto {
    @IsString()
    currentPassword: string;

    @IsString()
    @MinLength(6)
    newPassword: string;
}
