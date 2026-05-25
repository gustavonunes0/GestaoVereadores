import { PartialType } from '@nestjs/mapped-types';
import { CreateParlamentarDto } from './create-parlamentar.dto';

export class UpdateParlamentarDto extends PartialType(CreateParlamentarDto) {}
