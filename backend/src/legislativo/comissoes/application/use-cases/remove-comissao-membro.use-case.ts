import { Inject, Injectable } from '@nestjs/common';
import { TenantScopedUpdateError } from '../../../../common/prisma/tenant-scoped-update';
import { CommitteeRepository } from '../../domain/repositories/committee.repository';
import { CommitteeDomainService } from '../../domain/services/committee-domain.service';
import { COMMITTEE_REPOSITORY } from '../../comissoes.tokens';
import {
    ComissaoMembroNotFoundError,
    ComissaoNotFoundError,
} from '../errors/comissao.errors';
import { ComissaoViewModel } from '../view-models/comissao.view-model';

@Injectable()
export class RemoveComissaoMembroUseCase {
    private readonly domainService = new CommitteeDomainService();

    constructor(
        @Inject(COMMITTEE_REPOSITORY)
        private readonly committeeRepository: CommitteeRepository,
    ) {}

    async execute(
        tenantId: string,
        committeeId: string,
        memberId: string,
    ) {
        this.domainService.assertTenantIdProvided(tenantId);

        const committee = await this.committeeRepository.findById(
            tenantId,
            committeeId,
        );
        if (!committee) throw new ComissaoNotFoundError();

        try {
            await this.committeeRepository.removeMember(
                tenantId,
                committeeId,
                memberId,
            );
        } catch (error) {
            if (error instanceof TenantScopedUpdateError) {
                throw new ComissaoMembroNotFoundError();
            }
            throw error;
        }

        const refreshed = await this.committeeRepository.findById(
            tenantId,
            committeeId,
        );
        return ComissaoViewModel.toHttp(refreshed!);
    }
}
