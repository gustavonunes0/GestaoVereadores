import { PartialType } from '@nestjs/mapped-types';
import { CreateMateriaDto } from './materia.dto';

export class UpdateMateriaDto extends PartialType(CreateMateriaDto) {}
