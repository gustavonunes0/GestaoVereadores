import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ParliamentarianStatus } from '../../domain/enums/parliamentarian-status.enum';

export class UpdateParliamentarianDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    politicalPartyId?: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    parliamentaryName?: string;

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

    @ApiPropertyOptional({ enum: ParliamentarianStatus })
    @IsOptional()
    @IsEnum(ParliamentarianStatus)
    status?: ParliamentarianStatus;
}
