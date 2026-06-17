import { Inject, Injectable } from '@nestjs/common';
import { ComissaoNotFoundError } from '../../../legislativo/comissoes/application/errors/comissao.errors';
import { CommitteeRepository } from '../../../legislativo/comissoes/domain/repositories/committee.repository';
import { CommitteeStatus } from '../../../legislativo/comissoes/domain/enums/committee-status.enum';
import { COMMITTEE_REPOSITORY } from '../../../legislativo/comissoes/comissoes.tokens';
import { PortalNotFoundError } from '../../domain/errors/portal.errors';
import { PublicComissaoViewModel } from '../view-models/public-comissao.view-model';
import { ResolvePortalTenantUseCase } from './resolve-portal-tenant.use-case';

@Injectable()
export class GetPublicPortalComissaoUseCase {
    constructor(
        private readonly resolvePortalTenant: ResolvePortalTenantUseCase,
        @Inject(COMMITTEE_REPOSITORY)
        private readonly committeeRepository: CommitteeRepository,
    ) {}

    async execute(slug: string, committeeId: string) {
        const record = await this.resolvePortalTenant.execute(slug);
        if (!record.portal.secoes.comissoes) {
            throw new PortalNotFoundError();
        }

        const committee = await this.committeeRepository.findById(
            record.tenantId,
            committeeId,
        );
        if (
            !committee ||
            committee.entity.toPrimitives().status !== CommitteeStatus.ACTIVE
        ) {
            throw new ComissaoNotFoundError();
        }

        return PublicComissaoViewModel.toDetail(committee);
    }
}
