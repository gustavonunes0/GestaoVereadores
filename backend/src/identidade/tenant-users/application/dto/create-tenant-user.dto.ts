import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsOptional,
    IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TenantUserStatus } from '../../domain/entities/tenant-user.entity';

export class CreateTenantUserDto {
    @ApiProperty()
    @IsString()
    tenantId!: string;

    @ApiProperty()
    @IsString()
    userId!: string;

    @ApiPropertyOptional({ default: false })
    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isTenantAdmin?: boolean;

    @ApiPropertyOptional({ default: false })
    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isTenantStaff?: boolean;

    @ApiPropertyOptional({ default: false })
    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isParliamentarian?: boolean;

    @ApiPropertyOptional({ enum: TenantUserStatus })
    @IsOptional()
    @IsEnum(TenantUserStatus)
    status?: TenantUserStatus;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    permissions?: string[];
}
