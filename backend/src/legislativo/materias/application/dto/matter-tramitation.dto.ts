import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MatterTramitationAction } from '../../domain/enums/matter-tramitation-action.enum';

export class ExecutarTramitacaoMateriaDto {
    @ApiProperty({ enum: MatterTramitationAction })
    @IsEnum(MatterTramitationAction)
    action!: MatterTramitationAction;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    observacao?: string;
}
