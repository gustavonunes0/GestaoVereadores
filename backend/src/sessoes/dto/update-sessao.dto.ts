import { PartialType } from '@nestjs/mapped-types';
import { CreateSessaoPlenariaDto } from './sessao.dto';

export class UpdateSessaoPlenariaDto extends PartialType(CreateSessaoPlenariaDto) {}
