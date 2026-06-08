import { Inject, Injectable } from '@nestjs/common';
import { StatusMateria } from '@prisma/client';
import {
    MATTER_STATUS_LABELS,
    MatterStatus,
} from '../../domain/enums/matter-status.enum';
import { MateriaRepository } from '../../domain/repositories/materia.repository';
import { LegislativeMatterDomainService } from '../../domain/services/legislative-matter-domain.service';
import { MATERIA_REPOSITORY } from '../../materias.tokens';
import { MatterNotFoundError } from '../errors/matter.errors';
import {
    MateriaPrismaPayload,
    MatterViewModel,
} from '../view-models/matter.view-model';

@Injectable()
export class GetMatterWorkflowUseCase {
    private readonly domainService = new LegislativeMatterDomainService();

    constructor(
        @Inject(MATERIA_REPOSITORY)
        private readonly repository: MateriaRepository,
    ) {}

    async execute(tenantId: string, id: string) {
        this.domainService.assertTenantIdProvided(tenantId);

        let materia: unknown;
        try {
            materia = await this.repository.findOne(tenantId, id);
        } catch {
            throw new MatterNotFoundError();
        }

        const data = materia as MateriaPrismaPayload;
        const status = data.status as MatterStatus;
        const allowed = this.domainService.getAllowedTransitions(status);

        return {
            matterId: data.id,
            status: {
                value: status,
                label: MATTER_STATUS_LABELS[status],
            },
            capabilities: this.domainService.getWorkflowCapabilities(status),
            allowedTransitions: allowed.map((to) => ({
                value: to,
                label: MATTER_STATUS_LABELS[to],
            })),
            tramitacao: Array.isArray(data.tramitacaoJson)
                ? data.tramitacaoJson
                : [],
            summary: MatterViewModel.toHttp(data).workflow,
        };
    }
}
