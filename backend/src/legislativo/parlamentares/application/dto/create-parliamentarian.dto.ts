import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateParliamentarianDto {
    @ApiProperty()
    @IsUUID()
    tenantUserId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    politicalPartyId?: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    parliamentaryName: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    officeNumber?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    photoUrl?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    biography?: string;
}
