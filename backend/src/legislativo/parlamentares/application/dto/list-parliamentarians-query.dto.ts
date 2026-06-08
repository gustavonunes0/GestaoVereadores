import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination.dto';
import { ParliamentarianStatus } from '../../domain/enums/parliamentarian-status.enum';

export class ListParliamentariansQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: ParliamentarianStatus })
    @IsOptional()
    @IsEnum(ParliamentarianStatus)
    status?: ParliamentarianStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    politicalPartyId?: string;
}
