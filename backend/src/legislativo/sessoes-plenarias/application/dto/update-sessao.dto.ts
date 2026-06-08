import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { CreateSessaoPlenariaDto } from './sessao.dto';

export class UpdateSessaoPlenariaDto extends PartialType(
    CreateSessaoPlenariaDto,
) {
    /** Bloqueado — use POST /:id/ciclo-vida */
    @IsOptional()
    @IsString()
    situacaoId?: string;
}
