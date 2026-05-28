import { PartialType } from '@nestjs/mapped-types';
import { CreateLegislaturaDto } from './legislatura.dto';

export class UpdateLegislaturaDto extends PartialType(CreateLegislaturaDto) {}
