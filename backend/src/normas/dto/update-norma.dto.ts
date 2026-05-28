import { PartialType } from '@nestjs/mapped-types';
import { CreateNormaDto } from './norma.dto';

export class UpdateNormaDto extends PartialType(CreateNormaDto) {}
