import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';
import {
    GuestUserStatus,
    GuestUserType,
} from '../../domain/enums/guest-user.enums';

export class CreateGuestUserDto {
    @ApiProperty()
    @IsString()
    @MinLength(2)
    fullName!: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    cpf?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ enum: GuestUserType })
    @IsOptional()
    @IsEnum(GuestUserType)
    type?: GuestUserType;

    @ApiPropertyOptional({ enum: GuestUserStatus })
    @IsOptional()
    @IsEnum(GuestUserStatus)
    status?: GuestUserStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    organizationName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    positionName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    notes?: string;
}
