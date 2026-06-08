import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListTenantUsersQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    tenantId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    userId?: string;
}
