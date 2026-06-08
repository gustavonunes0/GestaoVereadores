import { Inject, Injectable } from '@nestjs/common';
import { PoliticalPartyRepository } from '../../domain/repositories/political-party.repository';
import { PoliticalPartyDomainService } from '../../domain/services/political-party-domain.service';
import { POLITICAL_PARTY_REPOSITORY } from '../../partidos-politicos.tokens';
import { PoliticalPartyNotFoundError } from '../errors/political-party.errors';
import { PoliticalPartyViewModel } from '../view-models/political-party.view-model';

@Injectable()
export class GetPoliticalPartyByIdUseCase {
    private readonly domainService = new PoliticalPartyDomainService();

    constructor(
        @Inject(POLITICAL_PARTY_REPOSITORY)
        private readonly politicalPartyRepository: PoliticalPartyRepository,
    ) {}

    async execute(tenantId: string, id: string) {
        this.domainService.assertTenantIdProvided(tenantId);

        const party = await this.politicalPartyRepository.findById(tenantId, id);
        try {
            this.domainService.assertBelongsToTenant(party, tenantId);
        } catch {
            throw new PoliticalPartyNotFoundError();
        }

        return PoliticalPartyViewModel.toHttp(party!);
    }
}
