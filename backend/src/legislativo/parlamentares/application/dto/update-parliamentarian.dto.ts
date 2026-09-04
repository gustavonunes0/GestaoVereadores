import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
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

    @ApiPropertyOptional({ minLength: 8, description: 'Nova senha de acesso (opcional)' })
    @IsOptional()
    @IsString()
    @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
    password?: string;
}
