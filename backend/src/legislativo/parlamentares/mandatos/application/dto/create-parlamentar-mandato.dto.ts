import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateParlamentarMandatoDto {
    @ApiProperty()
    @IsUUID()
    legislatureId!: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    partyAcronym?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    partyName?: string;

    @ApiPropertyOptional({ description: 'ISO 8601; padrão: agora' })
    @IsOptional()
    @IsDateString()
    startedAt?: string;
}
