import {
    IsDate,
    IsEmail,
    IsEnum,
    IsInt,
    IsObject,
    IsOptional,
    IsString,
    Matches,
    Max,
    MaxLength,
    Min,
    MinLength,
    ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TenantPlan, TenantStatus } from '../../../domain/tenant.entity';

export class CreateTenantDto {
    @IsString()
    @MinLength(3)
    name!: string;

    @IsString()
    @Matches(/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/)
    cnpj!: string;

    @IsOptional()
    @IsString()
    logo?: string | null;

    @IsOptional()
    @IsEnum(TenantStatus)
    status?: TenantStatus;

    @IsOptional()
    @IsObject()
    settings?: Record<string, unknown> | null;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    tradeName?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(120)
    city?: string | null;

    @IsOptional()
    @IsString()
    @Matches(/^[A-Za-z]{2}$/, { message: 'UF deve ter 2 letras' })
    state?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(120)
    contactName?: string | null;

    @IsOptional()
    @IsEmail()
    contactEmail?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(40)
    contactPhone?: string | null;

    @IsOptional()
    @IsEnum(TenantPlan)
    plan?: TenantPlan;

    @IsOptional()
    @ValidateIf((_, v) => v !== null)
    @Type(() => Date)
    @IsDate()
    contractStartAt?: Date | null;

    @IsOptional()
    @ValidateIf((_, v) => v !== null)
    @Type(() => Date)
    @IsDate()
    contractEndAt?: Date | null;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    monthlyFeeCents?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(28)
    billingDay?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    maxParliamentarians?: number | null;

    @IsOptional()
    @IsString()
    @MaxLength(4000)
    notes?: string | null;
}
