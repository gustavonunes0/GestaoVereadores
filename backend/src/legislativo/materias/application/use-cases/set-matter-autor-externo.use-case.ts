import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MatterAuthorshipDomainService } from '../../domain/services/matter-authorship-domain.service';
import { MateriaRepository } from '../../domain/repositories/materia.repository';
import { MATERIA_REPOSITORY } from '../../materias.tokens';
import { SetTenantPartnerDto } from '../dto/matter-autoria.dto';
import {
    TenantPartnerNotFoundForMatterError,
    MatterAuthorshipValidationError,
    MatterNotFoundError,
} from '../errors/matter.errors';
import { MatterAuthorshipViewModel } from '../view-models/matter-authorship.view-model';

@Injectable()
export class SetMatterTenantPartnerUseCase {
    private readonly domainService = new MatterAuthorshipDomainService();

    constructor(
        @Inject(MATERIA_REPOSITORY)
        private readonly repository: MateriaRepository,
    ) {}

    async execute(
        tenantId: string,
        matterId: string,
        dto: SetTenantPartnerDto,
    ) {
        this.domainService.assertTenantIdProvided(tenantId);
        try {
            this.domainService.assertExternalAuthorProvided(dto.tenantPartnerId);
        } catch (error) {
            throw new MatterAuthorshipValidationError(
                error instanceof Error ? error.message : 'Autor externo inválido',
            );
        }

        try {
            const data = await this.repository.setTenantPartner(
                tenantId,
                matterId,
                dto,
            );
            return MatterAuthorshipViewModel.toHttp(data);
        } catch (error) {
            if (error instanceof NotFoundException) {
                const msg = error.message;
                if (msg.includes('Autor externo') || msg.includes('Parceiro')) {
                    throw new TenantPartnerNotFoundForMatterError();
                }
                throw new MatterNotFoundError();
            }
            throw error;
        }
    }
}
