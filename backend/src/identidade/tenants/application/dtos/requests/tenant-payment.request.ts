import {
    IsDateString,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TenantPaymentStatusDto {
    PENDING = 'PENDING',
    PAID = 'PAID',
    OVERDUE = 'OVERDUE',
    CANCELLED = 'CANCELLED',
    WAIVED = 'WAIVED',
}

export enum TenantPaymentMethodDto {
    PIX = 'PIX',
    BOLETO = 'BOLETO',
    TRANSFER = 'TRANSFER',
    CARD = 'CARD',
    OTHER = 'OTHER',
}

export class CreateTenantPaymentDto {
    /** Competência no formato YYYY-MM. */
    @IsString()
    @Matches(/^\d{4}-\d{2}$/, { message: 'Competência deve estar no formato YYYY-MM' })
    competenceMonth!: string;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    amountCents!: number;

    @IsDateString()
    dueDate!: string;

    @IsOptional()
    @IsDateString()
    paidAt?: string | null;

    @IsOptional()
    @IsEnum(TenantPaymentStatusDto)
    status?: TenantPaymentStatusDto;

    @IsOptional()
    @IsEnum(TenantPaymentMethodDto)
    method?: TenantPaymentMethodDto | null;

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    notes?: string | null;
}

export class UpdateTenantPaymentDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    amountCents?: number;

    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @IsOptional()
    @IsDateString()
    paidAt?: string | null;

    @IsOptional()
    @IsEnum(TenantPaymentStatusDto)
    status?: TenantPaymentStatusDto;

    @IsOptional()
    @IsEnum(TenantPaymentMethodDto)
    method?: TenantPaymentMethodDto | null;

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    notes?: string | null;
}
