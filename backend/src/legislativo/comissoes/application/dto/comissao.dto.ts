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
import { CommitteeStatus } from '../../domain/enums/committee-status.enum';
import { CommitteeType } from '../../domain/enums/committee-type.enum';
import { CommitteeMemberRole } from '../../domain/enums/committee-member-role.enum';

export class CreateComissaoDto {
    @ApiProperty({ example: 'Comissão de Finanças e Orçamento' })
    @IsString()
    @MinLength(2)
    name!: string;

    @ApiPropertyOptional({ example: 'CFO' })
    @IsOptional()
    @IsString()
    @MinLength(2)
    acronym?: string;

    @ApiProperty({ enum: CommitteeType, example: CommitteeType.PERMANENT })
    @IsEnum(CommitteeType)
    type!: CommitteeType;

    @ApiProperty({
        description: 'Finalidade/objeto da comissão',
        example: 'Analisar matérias de natureza financeira e orçamentária.',
    })
    @IsString()
    @MinLength(1)
    purpose!: string;

    @ApiPropertyOptional({ description: 'ISO 8601 — início do período' })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional({ description: 'ISO 8601 — fim do período (opcional)' })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional({ enum: CommitteeStatus, default: CommitteeStatus.ACTIVE })
    @IsOptional()
    @IsEnum(CommitteeStatus)
    status?: CommitteeStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    notes?: string;
}

export class UpdateComissaoDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MinLength(2)
    name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MinLength(2)
    acronym?: string;

    @ApiPropertyOptional({ enum: CommitteeType })
    @IsOptional()
    @IsEnum(CommitteeType)
    type?: CommitteeType;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MinLength(1)
    purpose?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional({ enum: CommitteeStatus })
    @IsOptional()
    @IsEnum(CommitteeStatus)
    status?: CommitteeStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    notes?: string;
}

export class ListComissoesQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: CommitteeType })
    @IsOptional()
    @IsEnum(CommitteeType)
    type?: CommitteeType;

    @ApiPropertyOptional({ enum: CommitteeStatus })
    @IsOptional()
    @IsEnum(CommitteeStatus)
    status?: CommitteeStatus;
}

export class AddMembroComissaoDto {
    @ApiProperty()
    @IsUUID()
    parliamentarianId!: string;

    @ApiProperty({
        enum: CommitteeMemberRole,
        example: CommitteeMemberRole.MEMBER,
    })
    @IsEnum(CommitteeMemberRole)
    role!: CommitteeMemberRole;
}
