import { Inject, Injectable } from '@nestjs/common';
import { TenantScopedUpdateError } from '../../../../common/prisma/tenant-scoped-update';
import { CommitteeRepository } from '../../domain/repositories/committee.repository';
import { CommitteeDomainService } from '../../domain/services/committee-domain.service';
import { COMMITTEE_REPOSITORY } from '../../comissoes.tokens';
import { ComissaoNotFoundError } from '../errors/comissao.errors';

@Injectable()
export class RemoveComissaoUseCase {
    private readonly domainService = new CommitteeDomainService();

    constructor(
        @Inject(COMMITTEE_REPOSITORY)
        private readonly committeeRepository: CommitteeRepository,
    ) {}

    async execute(tenantId: string, id: string) {
        this.domainService.assertTenantIdProvided(tenantId);

        const existing = await this.committeeRepository.findById(
            tenantId,
            id,
        );
        if (!existing) throw new ComissaoNotFoundError();

        try {
            await this.committeeRepository.softDelete(tenantId, id);
        } catch (error) {
            if (error instanceof TenantScopedUpdateError) {
                throw new ComissaoNotFoundError();
            }
            throw error;
        }
    }
}
