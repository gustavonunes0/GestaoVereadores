import { Inject, Injectable } from '@nestjs/common';
import { CommitteeRepository } from '../../domain/repositories/committee.repository';
import { CommitteeDomainService } from '../../domain/services/committee-domain.service';
import { COMMITTEE_REPOSITORY } from '../../comissoes.tokens';
import { ComissaoNotFoundError } from '../errors/comissao.errors';
import { ComissaoViewModel } from '../view-models/comissao.view-model';

@Injectable()
export class GetComissaoByIdUseCase {
    private readonly domainService = new CommitteeDomainService();

    constructor(
        @Inject(COMMITTEE_REPOSITORY)
        private readonly committeeRepository: CommitteeRepository,
    ) {}

    async execute(tenantId: string, id: string) {
        this.domainService.assertTenantIdProvided(tenantId);

        const committee = await this.committeeRepository.findById(
            tenantId,
            id,
        );
        if (!committee) throw new ComissaoNotFoundError();

        return ComissaoViewModel.toHttp(committee);
    }
}
