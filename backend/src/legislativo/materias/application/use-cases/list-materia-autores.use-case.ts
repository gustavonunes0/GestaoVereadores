import { Inject, Injectable } from '@nestjs/common';
import { MateriaRepository } from '../../domain/repositories/materia.repository';
import { MATERIA_REPOSITORY } from '../../materias.tokens';

@Injectable()
export class ListMateriaAutoresUseCase {
    constructor(
        @Inject(MATERIA_REPOSITORY)
        private readonly repository: MateriaRepository,
    ) {}

    execute(tenantId: string, materiaId: string) {
        return this.repository.listarAutores(tenantId, materiaId);
    }
}
