import { Inject, Injectable } from '@nestjs/common';
import { AutorExternoRepository } from '../../domain/repositories/autor-externo.repository';
import { AUTOR_EXTERNO_REPOSITORY } from '../../autores-externos.tokens';
import { AutorExternoNotFoundError } from '../errors/autor-externo.errors';

@Injectable()
export class ListAutorExternoMateriasUseCase {
    constructor(
        @Inject(AUTOR_EXTERNO_REPOSITORY)
        private readonly repository: AutorExternoRepository,
    ) {}

    async execute(tenantId: string, autorExternoId: string) {
        const existing = await this.repository.findById(tenantId, autorExternoId);
        if (!existing) {
            throw new AutorExternoNotFoundError();
        }

        const materias = await this.repository.listMaterias(
            tenantId,
            autorExternoId,
        );

        return { data: materias, meta: { total: materias.length } };
    }
}
