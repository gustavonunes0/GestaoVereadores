import { Inject, Injectable } from '@nestjs/common';
import { MatterStatus } from '../../domain/enums/matter-status.enum';
import { MateriaRepository } from '../../domain/repositories/materia.repository';
import { LegislativeMatterDomainService } from '../../domain/services/legislative-matter-domain.service';
import { MATERIA_REPOSITORY } from '../../materias.tokens';
import { AlterarStatusMateriaDto } from '../dto/alterar-status-materia.dto';
import {
    MatterInvalidStatusTransitionError,
} from '../errors/matter.errors';
import {
    MateriaPrismaPayload,
    MatterViewModel,
} from '../view-models/matter.view-model';
import { rethrowIfMateriaNotFound } from './rethrow-if-materia-not-found';

@Injectable()
export class AlterarStatusMateriaUseCase {
    private readonly domainService = new LegislativeMatterDomainService();

    constructor(
        @Inject(MATERIA_REPOSITORY)
        private readonly repository: MateriaRepository,
    ) {}

    async execute(tenantId: string, id: string, dto: AlterarStatusMateriaDto) {
        this.domainService.assertTenantIdProvided(tenantId);

        let current: unknown;
        try {
            current = await this.repository.findOne(tenantId, id);
        } catch (error) {
            rethrowIfMateriaNotFound(error);
        }

        const materia = current as MateriaPrismaPayload;
        const from = materia.status as MatterStatus;
        const to = dto.status as MatterStatus;

        try {
            this.domainService.assertTransitionAllowed(from, to);
        } catch {
            throw new MatterInvalidStatusTransitionError(from, to);
        }

        const updated = await this.repository.alterarStatus(tenantId, id, dto);
        return MatterViewModel.toHttp(updated as MateriaPrismaPayload);
    }
}
