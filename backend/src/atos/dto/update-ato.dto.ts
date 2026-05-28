import { PartialType } from '@nestjs/mapped-types';
import { CreateAtoDto } from './ato.dto';

export class UpdateAtoDto extends PartialType(CreateAtoDto) {}
