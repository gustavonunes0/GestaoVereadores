import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { TenantUserRole, TenantUserStatus } from '../../../domain/tenant-user.entity';

export class CreateTenantUserDto {
    @IsString()
    tenantId: string;

    @IsString()
    userId: string;

    @IsOptional()
    @IsEnum(TenantUserRole)
    role?: TenantUserRole;

    @IsOptional()
    @IsEnum(TenantUserStatus)
    status?: TenantUserStatus;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isAdmin?: boolean;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    permissions?: string[];
}
