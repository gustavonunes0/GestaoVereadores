import { Inject, Injectable } from '@nestjs/common';
import { ParliamentarianRepository } from '../../domain/repositories/parliamentarian.repository';
import { PARLIAMENTARIAN_REPOSITORY } from '../../parlamentares.tokens';
import { ListParliamentariansQueryDto } from '../dto/list-parliamentarians-query.dto';
import { ParliamentarianViewModel } from '../view-models/parliamentarian.view-model';

@Injectable()
export class ListParliamentariansUseCase {
    constructor(
        @Inject(PARLIAMENTARIAN_REPOSITORY)
        private readonly parliamentarianRepository: ParliamentarianRepository,
    ) {}

    async execute(tenantId: string, query: ListParliamentariansQueryDto) {
        const result = await this.parliamentarianRepository.findMany(tenantId, {
            search: query.search,
            status: query.status,
            politicalPartyId: query.politicalPartyId,
            page: query.page,
            limit: query.limit,
        });
        return {
            data: result.data.map((item) =>
                ParliamentarianViewModel.toHttp(item),
            ),
            meta: result.meta,
        };
    }
}
