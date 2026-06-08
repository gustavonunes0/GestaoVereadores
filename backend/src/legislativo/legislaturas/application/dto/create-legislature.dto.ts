import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsDateString,
    IsInt,
    IsOptional,
    Min,
} from 'class-validator';

export class CreateLegislatureDto {
    @ApiProperty({ example: 2025 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    number: number;

    @ApiProperty({ example: '2025-01-01' })
    @IsDateString()
    startDate: string;

    @ApiPropertyOptional({ example: '2028-12-31' })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional({ default: false })
    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isCurrent?: boolean;
}
