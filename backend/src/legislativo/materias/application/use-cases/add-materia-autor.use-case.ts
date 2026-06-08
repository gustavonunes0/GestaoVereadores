import { Inject, Injectable } from '@nestjs/common';
import { MateriaRepository } from '../../domain/repositories/materia.repository';
import { MATERIA_REPOSITORY } from '../../materias.tokens';
import { AdicionarMateriaAutorDto } from '../dto/materia-autor.dto';

@Injectable()
export class AddMateriaAutorUseCase {
    constructor(
        @Inject(MATERIA_REPOSITORY)
        private readonly repository: MateriaRepository,
    ) {}

    execute(tenantId: string, materiaId: string, dto: AdicionarMateriaAutorDto) {
        return this.repository.adicionarAutor(tenantId, materiaId, dto);
    }
}
