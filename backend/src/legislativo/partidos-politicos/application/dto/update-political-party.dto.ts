import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePoliticalPartyDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    acronym?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    ideology?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    flagUrl?: string;
}
