import { Inject, Injectable, Logger } from '@nestjs/common';
import { MateriaRepository } from '../../domain/repositories/materia.repository';
import { MATERIA_REPOSITORY } from '../../materias.tokens';
import {
    MateriaPrismaPayload,
    MatterViewModel,
} from '../view-models/matter.view-model';
import { rethrowIfMateriaNotFound } from './rethrow-if-materia-not-found';

@Injectable()
export class GetMateriaByIdUseCase {
    private readonly logger = new Logger(GetMateriaByIdUseCase.name);

    constructor(
        @Inject(MATERIA_REPOSITORY)
        private readonly repository: MateriaRepository,
    ) {}

    async execute(tenantId: string, id: string) {
        let materia: unknown;
        try {
            materia = await this.repository.findOne(tenantId, id);
        } catch (error) {
            rethrowIfMateriaNotFound(error);
        }

        try {
            return MatterViewModel.toHttp(materia as MateriaPrismaPayload);
        } catch (error) {
            this.logger.error(
                `Falha ao serializar matéria ${id} (tenant ${tenantId})`,
                error instanceof Error ? error.stack : String(error),
            );
            throw error;
        }
    }
}
