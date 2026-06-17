import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MatterAuthorshipDomainService } from '../../domain/services/matter-authorship-domain.service';
import { MateriaRepository } from '../../domain/repositories/materia.repository';
import { MATERIA_REPOSITORY } from '../../materias.tokens';
import { SetAutorExternoDto } from '../dto/matter-autoria.dto';
import {
    GuestUserNotFoundForMatterError,
    MatterAuthorshipValidationError,
    MatterNotFoundError,
} from '../errors/matter.errors';
import { MatterAuthorshipViewModel } from '../view-models/matter-authorship.view-model';

@Injectable()
export class SetMatterAutorExternoUseCase {
    private readonly domainService = new MatterAuthorshipDomainService();

    constructor(
        @Inject(MATERIA_REPOSITORY)
        private readonly repository: MateriaRepository,
    ) {}

    async execute(
        tenantId: string,
        matterId: string,
        dto: SetAutorExternoDto,
    ) {
        this.domainService.assertTenantIdProvided(tenantId);
        try {
            this.domainService.assertExternalAuthorProvided(dto.autorExternoId);
        } catch (error) {
            throw new MatterAuthorshipValidationError(
                error instanceof Error ? error.message : 'Autor externo inválido',
            );
        }

        try {
            const data = await this.repository.setAutorExterno(
                tenantId,
                matterId,
                dto,
            );
            return MatterAuthorshipViewModel.toHttp(data);
        } catch (error) {
            if (error instanceof NotFoundException) {
                const msg = error.message;
                if (msg.includes('Autor externo')) {
                    throw new GuestUserNotFoundForMatterError();
                }
                throw new MatterNotFoundError();
            }
            throw error;
        }
    }
}
