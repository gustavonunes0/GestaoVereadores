import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SessionLifecycleAction } from '../../domain/enums/session-lifecycle-action.enum';

export class ExecutarCicloVidaSessaoDto {
    @ApiProperty({ enum: SessionLifecycleAction })
    @IsEnum(SessionLifecycleAction)
    action!: SessionLifecycleAction;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    observacao?: string;
}
