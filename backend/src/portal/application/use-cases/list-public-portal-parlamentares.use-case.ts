import { Inject, Injectable } from '@nestjs/common';
import { ListParliamentariansQueryDto } from '../../../legislativo/parlamentares/application/dto/list-parliamentarians-query.dto';
import { ParliamentarianRepository } from '../../../legislativo/parlamentares/domain/repositories/parliamentarian.repository';
import { ParliamentarianStatus } from '../../../legislativo/parlamentares/domain/enums/parliamentarian-status.enum';
import { PARLIAMENTARIAN_REPOSITORY } from '../../../legislativo/parlamentares/parlamentares.tokens';
import { ParliamentarianViewModel } from '../../../legislativo/parlamentares/application/view-models/parliamentarian.view-model';
import { PublicParliamentarianViewModel } from '../view-models/public-parliamentarian.view-model';
import { ResolvePortalTenantUseCase } from './resolve-portal-tenant.use-case';

@Injectable()
export class ListPublicPortalParlamentaresUseCase {
    constructor(
        private readonly resolvePortalTenant: ResolvePortalTenantUseCase,
        @Inject(PARLIAMENTARIAN_REPOSITORY)
        private readonly parliamentarianRepository: ParliamentarianRepository,
    ) {}

    async execute(slug: string, query: ListParliamentariansQueryDto) {
        const record = await this.resolvePortalTenant.execute(slug);
        if (!record.portal.secoes.vereadores) {
            return {
                data: [],
                meta: {
                    total: 0,
                    page: query.page ?? 1,
                    limit: query.limit ?? 20,
                    totalPages: 0,
                },
            };
        }

        const result = await this.parliamentarianRepository.findMany(
            record.tenantId,
            {
                search: query.search,
                status: ParliamentarianStatus.ACTIVE,
                politicalPartyId: query.politicalPartyId,
                page: query.page,
                limit: query.limit,
            },
        );

        return {
            data: result.data.map((item) =>
                PublicParliamentarianViewModel.toListItem(
                    ParliamentarianViewModel.toHttp(item),
                ),
            ),
            meta: result.meta,
        };
    }
}
