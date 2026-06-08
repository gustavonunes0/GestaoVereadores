import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsDateString,
    IsEnum,
    IsOptional,
    IsString,
    IsUUID,
    MinLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination.dto';
import { ParliamentaryFrontStatus } from '../../domain/enums/parliamentary-front-status.enum';

export class CreateFrenteDto {
    @ApiProperty({ example: 'Frente Parlamentar da Educação' })
    @IsString()
    @MinLength(2)
    name!: string;

    @ApiProperty({ example: 'Educação' })
    @IsString()
    @MinLength(1)
    theme!: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional({ enum: ParliamentaryFrontStatus })
    @IsOptional()
    @IsEnum(ParliamentaryFrontStatus)
    status?: ParliamentaryFrontStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    coordinatorParliamentarianId?: string;

    @ApiPropertyOptional({
        description: 'TenantUser responsável pelo cadastro',
    })
    @IsOptional()
    @IsUUID()
    createdByTenantUserId?: string;
}

export class UpdateFrenteDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MinLength(2)
    name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MinLength(1)
    theme?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional({ enum: ParliamentaryFrontStatus })
    @IsOptional()
    @IsEnum(ParliamentaryFrontStatus)
    status?: ParliamentaryFrontStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    coordinatorParliamentarianId?: string;
}

export class ListFrentesQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    theme?: string;

    @ApiPropertyOptional({ enum: ParliamentaryFrontStatus })
    @IsOptional()
    @IsEnum(ParliamentaryFrontStatus)
    status?: ParliamentaryFrontStatus;
}

export class AddMembroFrenteDto {
    @ApiProperty()
    @IsUUID()
    parliamentarianId!: string;

    @ApiPropertyOptional({
        description:
            'Define o parlamentar como coordenador/presidente da frente',
    })
    @IsOptional()
    @IsBoolean()
    setAsCoordinator?: boolean;
}
