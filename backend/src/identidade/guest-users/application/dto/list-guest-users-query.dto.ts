import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import {
    GuestUserStatus,
    GuestUserType,
} from '../../domain/enums/guest-user.enums';

export class ListGuestUsersQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: GuestUserType })
    @IsOptional()
    @IsEnum(GuestUserType)
    type?: GuestUserType;

    @ApiPropertyOptional({ enum: GuestUserStatus })
    @IsOptional()
    @IsEnum(GuestUserStatus)
    status?: GuestUserStatus;

    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ default: 20 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;
}
