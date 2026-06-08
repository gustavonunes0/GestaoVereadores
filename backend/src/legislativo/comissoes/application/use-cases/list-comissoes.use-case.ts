import { Inject, Injectable } from '@nestjs/common';
import { CommitteeRepository } from '../../domain/repositories/committee.repository';
import { CommitteeDomainService } from '../../domain/services/committee-domain.service';
import { COMMITTEE_REPOSITORY } from '../../comissoes.tokens';
import { ListComissoesQueryDto } from '../dto/comissao.dto';
import { ComissaoViewModel } from '../view-models/comissao.view-model';

@Injectable()
export class ListComissoesUseCase {
    private readonly domainService = new CommitteeDomainService();

    constructor(
        @Inject(COMMITTEE_REPOSITORY)
        private readonly committeeRepository: CommitteeRepository,
    ) {}

    async execute(tenantId: string, query: ListComissoesQueryDto) {
        this.domainService.assertTenantIdProvided(tenantId);

        const result = await this.committeeRepository.findMany(tenantId, query);
        return {
            ...result,
            data: result.data.map((item) => ComissaoViewModel.toHttp(item)),
        };
    }
}
