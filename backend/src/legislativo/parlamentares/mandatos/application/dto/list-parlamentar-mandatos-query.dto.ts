import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../../common/dto/pagination.dto';
import { MandateStatus } from '../../domain/enums/mandate-status.enum';

export class ListParlamentarMandatosQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional({ enum: MandateStatus })
    @IsOptional()
    @IsEnum(MandateStatus)
    status?: MandateStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    legislatureId?: string;
}
