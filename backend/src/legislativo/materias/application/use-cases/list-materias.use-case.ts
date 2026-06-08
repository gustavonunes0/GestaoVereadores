import { Inject, Injectable } from '@nestjs/common';
import { MateriaRepository } from '../../domain/repositories/materia.repository';
import { MATERIA_REPOSITORY } from '../../materias.tokens';
import { FilterMateriaDto } from '../dto/materia.dto';
import {
    MateriaPrismaPayload,
    MatterViewModel,
} from '../view-models/matter.view-model';

@Injectable()
export class ListMateriasUseCase {
    constructor(
        @Inject(MATERIA_REPOSITORY)
        private readonly repository: MateriaRepository,
    ) {}

    async execute(tenantId: string, filters: FilterMateriaDto) {
        const result = await this.repository.findAll(tenantId, filters);
        const paginated = result as {
            data: MateriaPrismaPayload[];
            meta: unknown;
        };

        return {
            ...paginated,
            data: paginated.data.map((item) => MatterViewModel.toHttp(item)),
        };
    }
}
