import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsDateString,
    IsEnum,
    IsOptional,
    IsString,
    IsUUID,
    ValidateIf,
} from 'class-validator';
import { CondicaoMandato } from '../../domain/enums/condicao-mandato.enum';

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

    @ApiPropertyOptional({ enum: CondicaoMandato, default: CondicaoMandato.TITULAR })
    @IsOptional()
    @IsEnum(CondicaoMandato)
    condicao?: CondicaoMandato;

    @ApiPropertyOptional({
        description: 'Parlamentar titular afastado (quando condição = SUPLENTE)',
        nullable: true,
    })
    @IsOptional()
    @ValidateIf((_, v) => v !== null)
    @IsUUID()
    titularAfastadoId?: string | null;

    @ApiPropertyOptional({ description: 'ISO 8601; padrão: agora' })
    @IsOptional()
    @IsDateString()
    startedAt?: string;
}
