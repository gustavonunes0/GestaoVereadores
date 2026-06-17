import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { AutorExternoRepository } from '../../domain/repositories/autor-externo.repository';
import { AUTOR_EXTERNO_REPOSITORY } from '../../autores-externos.tokens';
import { UpdateAutorExternoDto } from '../dto/update-autor-externo.dto';
import {
    AutorExternoNotFoundError,
    TipoAutorInvalidoError,
} from '../errors/autor-externo.errors';
import { AutorExternoViewModel } from '../view-models/autor-externo.view-model';

@Injectable()
export class UpdateAutorExternoUseCase {
    constructor(
        @Inject(AUTOR_EXTERNO_REPOSITORY)
        private readonly repository: AutorExternoRepository,
    ) {}

    async execute(tenantId: string, id: string, dto: UpdateAutorExternoDto) {
        const existing = await this.repository.findById(tenantId, id);
        if (!existing) {
            throw new AutorExternoNotFoundError();
        }

        if (dto.tipoAutorId) {
            const tipoValido = await this.repository.existsTipoAutor(
                dto.tipoAutorId,
            );
            if (!tipoValido) {
                throw new TipoAutorInvalidoError();
            }
        }

        try {
            const updated = await this.repository.update(tenantId, id, dto);
            return AutorExternoViewModel.toHttp(updated);
        } catch (error) {
            if (error instanceof Error && error.message.includes('obrigatório')) {
                throw new BadRequestException(error.message);
            }
            throw error;
        }
    }
}
