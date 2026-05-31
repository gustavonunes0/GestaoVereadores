import { IsOptional, IsString } from 'class-validator';

export class ListTenantUsersDto {
    @IsOptional()
    @IsString()
    tenantId?: string;

    @IsOptional()
    @IsString()
    userId?: string;
}
