import { Inject, Injectable } from '@nestjs/common';
import {
    MATTER_TRAMITATION_ACTION_LABELS,
    MatterTramitationAction,
} from '../../domain/enums/matter-tramitation-action.enum';
import {
    MATTER_STATUS_LABELS,
    MatterStatus,
} from '../../domain/enums/matter-status.enum';
import { MateriaRepository } from '../../domain/repositories/materia.repository';
import { MatterTramitationDomainService } from '../../domain/services/matter-tramitation-domain.service';
import { MATERIA_REPOSITORY } from '../../materias.tokens';
import { MateriaPrismaPayload } from '../view-models/matter.view-model';
import { rethrowIfMateriaNotFound } from './rethrow-if-materia-not-found';

@Injectable()
export class ListMatterTramitationActionsUseCase {
    private readonly tramitationService = new MatterTramitationDomainService();

    constructor(
        @Inject(MATERIA_REPOSITORY)
        private readonly repository: MateriaRepository,
    ) {}

    async execute(tenantId: string, matterId: string) {
        let current: MateriaPrismaPayload;
        try {
            current = (await this.repository.findOne(
                tenantId,
                matterId,
            )) as MateriaPrismaPayload;
        } catch (error) {
            rethrowIfMateriaNotFound(error);
        }

        const status = current.status as MatterStatus;
        const actions = this.tramitationService.getAvailableActions(status);

        return {
            matterId,
            status: {
                value: status,
                label: MATTER_STATUS_LABELS[status],
            },
            actions: actions.map((action: MatterTramitationAction) => {
                const target = this.tramitationService.resolveTransition(
                    status,
                    action,
                );
                return {
                    action,
                    label: MATTER_TRAMITATION_ACTION_LABELS[action],
                    targetStatus: {
                        value: target,
                        label: MATTER_STATUS_LABELS[target],
                    },
                };
            }),
        };
    }
}
