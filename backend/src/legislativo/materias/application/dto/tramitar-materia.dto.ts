import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { MatterStatus } from '../../domain/enums/matter-status.enum';

export class TramitarMateriaDto {
    @ApiProperty({ enum: MatterStatus })
    @IsEnum(MatterStatus)
    novoStatus: MatterStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    despacho?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    observacao?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    unidadeDestinoId?: string;
}
