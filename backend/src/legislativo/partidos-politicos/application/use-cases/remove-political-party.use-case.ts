import { Inject, Injectable } from '@nestjs/common';
import { PoliticalPartyRepository } from '../../domain/repositories/political-party.repository';
import { PoliticalPartyDomainService } from '../../domain/services/political-party-domain.service';
import { POLITICAL_PARTY_REPOSITORY } from '../../partidos-politicos.tokens';
import {
    PoliticalPartyHasActiveParliamentariansError,
    PoliticalPartyNotFoundError,
} from '../errors/political-party.errors';

@Injectable()
export class RemovePoliticalPartyUseCase {
    private readonly domainService = new PoliticalPartyDomainService();

    constructor(
        @Inject(POLITICAL_PARTY_REPOSITORY)
        private readonly politicalPartyRepository: PoliticalPartyRepository,
    ) {}

    async execute(tenantId: string, id: string) {
        this.domainService.assertTenantIdProvided(tenantId);

        const existing = await this.politicalPartyRepository.findById(
            tenantId,
            id,
        );
        try {
            this.domainService.assertBelongsToTenant(existing, tenantId);
        } catch {
            throw new PoliticalPartyNotFoundError();
        }

        const activeCount =
            await this.politicalPartyRepository.countActiveParliamentarians(
                tenantId,
                id,
            );
        try {
            this.domainService.assertCanRemove(activeCount);
        } catch {
            throw new PoliticalPartyHasActiveParliamentariansError();
        }

        existing!.markRemoved();
        await this.politicalPartyRepository.softDelete(tenantId, id);
    }
}
