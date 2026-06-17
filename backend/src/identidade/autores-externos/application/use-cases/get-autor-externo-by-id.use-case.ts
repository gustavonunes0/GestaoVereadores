import { Inject, Injectable } from '@nestjs/common';
import { AutorExternoRepository } from '../../domain/repositories/autor-externo.repository';
import { AUTOR_EXTERNO_REPOSITORY } from '../../autores-externos.tokens';
import { AutorExternoNotFoundError } from '../errors/autor-externo.errors';
import { AutorExternoViewModel } from '../view-models/autor-externo.view-model';

@Injectable()
export class GetAutorExternoByIdUseCase {
    constructor(
        @Inject(AUTOR_EXTERNO_REPOSITORY)
        private readonly repository: AutorExternoRepository,
    ) {}

    async execute(tenantId: string, id: string) {
        const item = await this.repository.findById(tenantId, id);
        if (!item) {
            throw new AutorExternoNotFoundError();
        }
        return AutorExternoViewModel.toHttp(item);
    }
}
