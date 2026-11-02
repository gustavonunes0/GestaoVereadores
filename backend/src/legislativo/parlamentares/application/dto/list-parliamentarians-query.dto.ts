import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
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

    /** Quando informado, retorna só quem tem mandato ACTIVE nessa legislatura. */
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    legislatureId?: string;

    /** Filtra parlamentares com foto e enquadramento ainda não confirmado. */
    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => {
        if (value === true || value === 'true' || value === '1') return true;
        if (value === false || value === 'false' || value === '0') return false;
        return value;
    })
    @IsBoolean()
    fotoPendente?: boolean;
}
