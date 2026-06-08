import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsDateString,
    IsEnum,
    IsOptional,
    IsString,
    IsUUID,
    MinLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination.dto';
import { BoardStatus } from '../../domain/enums/board-status.enum';

export class CreateMesaDiretoraDto {
    @ApiProperty({ example: 'Mesa Diretora 2025-2026' })
    @IsString()
    @MinLength(1)
    name!: string;

    @ApiProperty()
    @IsUUID()
    legislatureId!: string;

    @ApiProperty({ description: 'ISO 8601 — início do período (customizável)' })
    @IsDateString()
    startDate!: string;

    @ApiPropertyOptional({
        description: 'ISO 8601 — fim do período (1, 2, 4 anos ou customizado)',
    })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional({ enum: BoardStatus, default: BoardStatus.ACTIVE })
    @IsOptional()
    @IsEnum(BoardStatus)
    status?: BoardStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    notes?: string;
}

export class UpdateMesaDiretoraDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MinLength(1)
    name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional({ enum: BoardStatus })
    @IsOptional()
    @IsEnum(BoardStatus)
    status?: BoardStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    notes?: string;
}

export class ListMesaDiretoraQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    legislatureId?: string;

    @ApiPropertyOptional({ enum: BoardStatus })
    @IsOptional()
    @IsEnum(BoardStatus)
    status?: BoardStatus;
}

export class AddMembroMesaDto {
    @ApiProperty()
    @IsUUID()
    parliamentarianId!: string;

    @ApiProperty()
    @IsUUID()
    boardRoleId!: string;
}

export class CreateCargoMesaDto {
    @ApiProperty({ example: 'Presidente' })
    @IsString()
    @MinLength(1)
    name!: string;
}
