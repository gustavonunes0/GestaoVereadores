import { PartialType } from '@nestjs/swagger';
import { CreateAutorExternoDto } from './create-autor-externo.dto';

export class UpdateAutorExternoDto extends PartialType(CreateAutorExternoDto) {}
