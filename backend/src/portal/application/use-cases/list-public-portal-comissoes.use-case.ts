import { Inject, Injectable } from '@nestjs/common';
import { ListComissoesQueryDto } from '../../../legislativo/comissoes/application/dto/comissao.dto';
import { CommitteeRepository } from '../../../legislativo/comissoes/domain/repositories/committee.repository';
import { CommitteeStatus } from '../../../legislativo/comissoes/domain/enums/committee-status.enum';
import { COMMITTEE_REPOSITORY } from '../../../legislativo/comissoes/comissoes.tokens';
import { PublicComissaoViewModel } from '../view-models/public-comissao.view-model';
import { ResolvePortalTenantUseCase } from './resolve-portal-tenant.use-case';

@Injectable()
export class ListPublicPortalComissoesUseCase {
    constructor(
        private readonly resolvePortalTenant: ResolvePortalTenantUseCase,
        @Inject(COMMITTEE_REPOSITORY)
        private readonly committeeRepository: CommitteeRepository,
    ) {}

    async execute(slug: string, query: ListComissoesQueryDto) {
        const record = await this.resolvePortalTenant.execute(slug);
        if (!record.portal.secoes.comissoes) {
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

        const result = await this.committeeRepository.findMany(
            record.tenantId,
            {
                search: query.search,
                type: query.type,
                status: CommitteeStatus.ACTIVE,
                page: query.page,
                limit: query.limit,
            },
        );

        return {
            data: result.data.map((item) =>
                PublicComissaoViewModel.toListItem(item),
            ),
            meta: result.meta,
        };
    }
}
