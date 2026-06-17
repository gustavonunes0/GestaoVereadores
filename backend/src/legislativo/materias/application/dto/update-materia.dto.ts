import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { CreateMateriaDto } from './materia.dto';

export class UpdateMateriaDto extends PartialType(CreateMateriaDto) {
    @IsOptional()
    @IsString()
    textoOriginalUrl?: string;
}
