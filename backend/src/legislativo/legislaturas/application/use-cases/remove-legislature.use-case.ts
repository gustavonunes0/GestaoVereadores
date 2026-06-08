import { Inject, Injectable } from '@nestjs/common';
import { LegislatureRepository } from '../../domain/repositories/legislature.repository';
import { LegislatureDomainService } from '../../domain/services/legislature-domain.service';
import { LEGISLATURE_REPOSITORY } from '../../legislaturas.tokens';
import {
    LegislatureHasActiveMandatesError,
    LegislatureNotFoundError,
} from '../errors/legislature.errors';

@Injectable()
export class RemoveLegislatureUseCase {
    private readonly domainService = new LegislatureDomainService();

    constructor(
        @Inject(LEGISLATURE_REPOSITORY)
        private readonly legislatureRepository: LegislatureRepository,
    ) {}

    async execute(tenantId: string, id: string) {
        this.domainService.assertTenantIdProvided(tenantId);

        const existing = await this.legislatureRepository.findById(
            tenantId,
            id,
        );
        try {
            this.domainService.assertBelongsToTenant(existing, tenantId);
        } catch {
            throw new LegislatureNotFoundError();
        }

        const activeMandates =
            await this.legislatureRepository.countActiveMandates(
                tenantId,
                id,
            );
        try {
            this.domainService.assertCanRemove(activeMandates);
        } catch {
            throw new LegislatureHasActiveMandatesError();
        }

        existing!.markRemoved();
        await this.legislatureRepository.softDelete(tenantId, id);
    }
}
