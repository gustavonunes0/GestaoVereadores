import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MatterAuthorshipDomainService } from '../../domain/services/matter-authorship-domain.service';
import { MateriaRepository } from '../../domain/repositories/materia.repository';
import { MATERIA_REPOSITORY } from '../../materias.tokens';
import { SetAutorParlamentarDto } from '../dto/matter-autoria.dto';
import {
    MatterAuthorshipValidationError,
    MatterNotFoundError,
    ParliamentarianNotFoundForMatterError,
} from '../errors/matter.errors';
import { MatterAuthorshipViewModel } from '../view-models/matter-authorship.view-model';

@Injectable()
export class SetMatterAutorParlamentarUseCase {
    private readonly domainService = new MatterAuthorshipDomainService();

    constructor(
        @Inject(MATERIA_REPOSITORY)
        private readonly repository: MateriaRepository,
    ) {}

    async execute(
        tenantId: string,
        matterId: string,
        dto: SetAutorParlamentarDto,
    ) {
        this.domainService.assertTenantIdProvided(tenantId);
        try {
            this.domainService.assertParliamentarianAuthorProvided(
                dto.parliamentarianId,
            );
        } catch (error) {
            throw new MatterAuthorshipValidationError(
                error instanceof Error ? error.message : 'Autor inválido',
            );
        }

        try {
            const data = await this.repository.setAutorParlamentar(
                tenantId,
                matterId,
                dto,
            );
            return MatterAuthorshipViewModel.toHttp(data);
        } catch (error) {
            if (error instanceof NotFoundException) {
                const msg = error.message;
                if (msg.includes('Parlamentar')) {
                    throw new ParliamentarianNotFoundForMatterError();
                }
                throw new MatterNotFoundError();
            }
            throw error;
        }
    }
}
