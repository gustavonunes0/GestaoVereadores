import { PartialType } from '@nestjs/swagger';
import { CreateAtoDto } from './create-ato.dto';

export class UpdateAtoDto extends PartialType(CreateAtoDto) {}
