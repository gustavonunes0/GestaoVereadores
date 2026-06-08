import { Inject, Injectable } from '@nestjs/common';
import { LegislatureRepository } from '../../domain/repositories/legislature.repository';
import { LegislatureDomainService } from '../../domain/services/legislature-domain.service';
import { LEGISLATURE_REPOSITORY } from '../../legislaturas.tokens';
import { ListLegislaturesQueryDto } from '../dto/list-legislatures-query.dto';
import { LegislatureViewModel } from '../view-models/legislature.view-model';

@Injectable()
export class ListLegislaturesUseCase {
    private readonly domainService = new LegislatureDomainService();

    constructor(
        @Inject(LEGISLATURE_REPOSITORY)
        private readonly legislatureRepository: LegislatureRepository,
    ) {}

    async execute(tenantId: string, query: ListLegislaturesQueryDto) {
        this.domainService.assertTenantIdProvided(tenantId);

        const result = await this.legislatureRepository.findMany(tenantId, {
            search: query.search,
            isCurrent: query.isCurrent,
            page: query.page,
            limit: query.limit,
        });
        return {
            data: result.data.map((item) => LegislatureViewModel.toHttp(item)),
            meta: result.meta,
        };
    }
}
