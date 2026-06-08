import { PartialType } from '@nestjs/swagger';
import { CreateNormaDto } from './create-norma.dto';

export class UpdateNormaDto extends PartialType(CreateNormaDto) {}
