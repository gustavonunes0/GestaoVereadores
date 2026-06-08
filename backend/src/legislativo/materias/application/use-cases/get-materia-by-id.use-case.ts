import { Inject, Injectable } from '@nestjs/common';
import { MateriaRepository } from '../../domain/repositories/materia.repository';
import { MATERIA_REPOSITORY } from '../../materias.tokens';
import { MatterNotFoundError } from '../errors/matter.errors';
import {
    MateriaPrismaPayload,
    MatterViewModel,
} from '../view-models/matter.view-model';

@Injectable()
export class GetMateriaByIdUseCase {
    constructor(
        @Inject(MATERIA_REPOSITORY)
        private readonly repository: MateriaRepository,
    ) {}

    async execute(tenantId: string, id: string) {
        try {
            const materia = await this.repository.findOne(tenantId, id);
            return MatterViewModel.toHttp(materia as MateriaPrismaPayload);
        } catch {
            throw new MatterNotFoundError();
        }
    }
}
