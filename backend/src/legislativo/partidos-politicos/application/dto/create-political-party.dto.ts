import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePoliticalPartyDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    acronym: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    ideology?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    flagUrl?: string;
}
