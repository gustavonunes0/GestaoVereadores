import {
    IsEnum,
    IsObject,
    IsOptional,
    IsString,
    Matches,
    MinLength,
} from 'class-validator';
import { TenantStatus } from '../../../domain/tenant.entity';

export class CreateTenantDto {
    @IsString()
    @MinLength(3)
    name: string;

    @IsString()
    @Matches(/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/)
    cnpj: string;

    @IsOptional()
    @IsString()
    logo?: string | null;

    @IsOptional()
    @IsEnum(TenantStatus)
    status?: TenantStatus;

    @IsOptional()
    @IsObject()
    settings?: Record<string, unknown> | null;
}
