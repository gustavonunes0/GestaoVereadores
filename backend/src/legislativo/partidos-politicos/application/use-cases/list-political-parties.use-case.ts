import { Inject, Injectable } from '@nestjs/common';
import { PoliticalPartyRepository } from '../../domain/repositories/political-party.repository';
import { PoliticalPartyDomainService } from '../../domain/services/political-party-domain.service';
import { POLITICAL_PARTY_REPOSITORY } from '../../partidos-politicos.tokens';
import { ListPoliticalPartiesQueryDto } from '../dto/list-political-parties-query.dto';
import { PoliticalPartyViewModel } from '../view-models/political-party.view-model';

@Injectable()
export class ListPoliticalPartiesUseCase {
    private readonly domainService = new PoliticalPartyDomainService();

    constructor(
        @Inject(POLITICAL_PARTY_REPOSITORY)
        private readonly politicalPartyRepository: PoliticalPartyRepository,
    ) {}

    async execute(tenantId: string, query: ListPoliticalPartiesQueryDto) {
        this.domainService.assertTenantIdProvided(tenantId);

        const result = await this.politicalPartyRepository.findMany(tenantId, {
            search: query.search,
            page: query.page,
            limit: query.limit,
        });
        return {
            data: result.data.map((item) => PoliticalPartyViewModel.toHttp(item)),
            meta: result.meta,
        };
    }
}
