import { PartialType } from '@nestjs/mapped-types';
import { CreateFrenteDto } from './create-frente.dto';

export class UpdateFrenteDto extends PartialType(CreateFrenteDto) {}
