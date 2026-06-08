import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MateriaRepository } from '../../domain/repositories/materia.repository';
import { MATERIA_REPOSITORY } from '../../materias.tokens';
import { MatterNotFoundError } from '../errors/matter.errors';
import { MatterAuthorshipViewModel } from '../view-models/matter-authorship.view-model';

@Injectable()
export class GetMatterAuthorshipUseCase {
    constructor(
        @Inject(MATERIA_REPOSITORY)
        private readonly repository: MateriaRepository,
    ) {}

    async execute(tenantId: string, matterId: string) {
        try {
            const data = await this.repository.getAutoria(tenantId, matterId);
            return MatterAuthorshipViewModel.toHttp(data);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new MatterNotFoundError();
            }
            throw error;
        }
    }
}
