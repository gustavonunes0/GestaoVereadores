import { Inject, Injectable } from '@nestjs/common';
import { MatterStatus } from '../../domain/enums/matter-status.enum';
import { MateriaRepository } from '../../domain/repositories/materia.repository';
import { MatterTramitationDomainService } from '../../domain/services/matter-tramitation-domain.service';
import { MATERIA_REPOSITORY } from '../../materias.tokens';
import { ExecutarTramitacaoMateriaDto } from '../dto/matter-tramitation.dto';
import {
    MatterNotFoundError,
    MatterTramitationActionNotAllowedError,
} from '../errors/matter.errors';
import {
    MateriaPrismaPayload,
    MatterViewModel,
} from '../view-models/matter.view-model';

@Injectable()
export class ExecuteMatterTramitationUseCase {
    private readonly tramitationService = new MatterTramitationDomainService();

    constructor(
        @Inject(MATERIA_REPOSITORY)
        private readonly repository: MateriaRepository,
    ) {}

    async execute(
        tenantId: string,
        matterId: string,
        dto: ExecutarTramitacaoMateriaDto,
    ) {
        let current: MateriaPrismaPayload;
        try {
            current = (await this.repository.findOne(
                tenantId,
                matterId,
            )) as MateriaPrismaPayload;
        } catch {
            throw new MatterNotFoundError();
        }

        const status = current.status as MatterStatus;
        const available = this.tramitationService.getAvailableActions(status);
        if (!available.includes(dto.action)) {
            throw new MatterTramitationActionNotAllowedError(
                dto.action,
                status,
            );
        }

        const updated = await this.repository.tramitarMateria(
            tenantId,
            matterId,
            dto,
        );
        return MatterViewModel.toHttp(updated as MateriaPrismaPayload);
    }
}
