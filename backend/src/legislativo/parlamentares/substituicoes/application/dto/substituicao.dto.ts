import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEnum,
    IsISO8601,
    IsOptional,
    IsString,
    IsUUID,
    Matches,
    MaxLength,
    ValidateIf,
} from 'class-validator';
import { MotivoSubstituicao } from '../../domain/enums/substituicao.enums';

const DATA_CIVIL = { strict: true } as const;
const FORMATO_DATA_CIVIL = /^\d{4}-\d{2}-\d{2}$/;
const MSG_FORMATO_DATA = { message: 'Use o formato AAAA-MM-DD' };

export class CreateSubstituicaoDto {
    @ApiProperty()
    @IsUUID()
    titularId!: string;

    @ApiProperty()
    @IsUUID()
    suplenteId!: string;

    @ApiProperty({ enum: MotivoSubstituicao })
    @IsEnum(MotivoSubstituicao)
    motivo!: MotivoSubstituicao;

    @ApiProperty({ example: '2026-10-01', description: 'AAAA-MM-DD' })
    @IsISO8601(DATA_CIVIL)
    @Matches(FORMATO_DATA_CIVIL, MSG_FORMATO_DATA)
    dataInicio!: string;

    @ApiPropertyOptional({ example: '2026-12-31', nullable: true })
    @IsOptional()
    @ValidateIf((_, v) => v !== null)
    @IsISO8601(DATA_CIVIL)
    @Matches(FORMATO_DATA_CIVIL, MSG_FORMATO_DATA)
    dataFim?: string | null;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    observacao?: string;
}

export class UpdateSubstituicaoDto {
    @ApiPropertyOptional({ example: '2026-10-01' })
    @IsOptional()
    @IsISO8601(DATA_CIVIL)
    @Matches(FORMATO_DATA_CIVIL, MSG_FORMATO_DATA)
    dataInicio?: string;

    @ApiPropertyOptional({ example: '2026-12-31', nullable: true })
    @IsOptional()
    @ValidateIf((_, v) => v !== null)
    @IsISO8601(DATA_CIVIL)
    @Matches(FORMATO_DATA_CIVIL, MSG_FORMATO_DATA)
    dataFim?: string | null;

    @ApiPropertyOptional({ nullable: true })
    @IsOptional()
    @ValidateIf((_, v) => v !== null)
    @IsString()
    @MaxLength(2000)
    observacao?: string | null;
}

export class ListSubstituicoesQueryDto {
    @ApiProperty()
    @IsUUID()
    parliamentarianId!: string;
}

export class SuplentesElegiveisQueryDto {
    @ApiProperty()
    @IsUUID()
    titularId!: string;
}
