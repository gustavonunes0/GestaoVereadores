import { Inject, Injectable } from '@nestjs/common';
import { AutorExternoRepository } from '../../domain/repositories/autor-externo.repository';
import { AUTOR_EXTERNO_REPOSITORY } from '../../autores-externos.tokens';
import { AutorExternoNotFoundError } from '../errors/autor-externo.errors';

@Injectable()
export class RemoveAutorExternoUseCase {
    constructor(
        @Inject(AUTOR_EXTERNO_REPOSITORY)
        private readonly repository: AutorExternoRepository,
    ) {}

    async execute(tenantId: string, id: string) {
        const existing = await this.repository.findById(tenantId, id);
        if (!existing) {
            throw new AutorExternoNotFoundError();
        }
        await this.repository.softDelete(tenantId, id);
    }
}
