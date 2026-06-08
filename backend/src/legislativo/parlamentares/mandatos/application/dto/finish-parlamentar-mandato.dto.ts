import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { MandateStatus } from '../../domain/enums/mandate-status.enum';

export class FinishParlamentarMandatoDto {
    @ApiPropertyOptional({
        enum: [
            MandateStatus.FINISHED,
            MandateStatus.INTERRUPTED,
            MandateStatus.LICENSED,
        ],
        default: MandateStatus.FINISHED,
    })
    @IsOptional()
    @IsEnum(MandateStatus)
    status?: MandateStatus;

    @ApiPropertyOptional({ description: 'ISO 8601; padrão: agora' })
    @IsOptional()
    @IsDateString()
    endedAt?: string;
}
