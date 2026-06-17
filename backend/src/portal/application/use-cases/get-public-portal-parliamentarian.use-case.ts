import { Inject, Injectable } from '@nestjs/common';
import { ParliamentarianNotFoundError } from '../../../legislativo/parlamentares/application/errors/parliamentarian.errors';
import { ParliamentarianProfileViewModel } from '../../../legislativo/parlamentares/application/view-models/parliamentarian-profile.view-model';
import { ParliamentarianStatus } from '../../../legislativo/parlamentares/domain/enums/parliamentarian-status.enum';
import { ParliamentarianRepository } from '../../../legislativo/parlamentares/domain/repositories/parliamentarian.repository';
import { PARLIAMENTARIAN_REPOSITORY } from '../../../legislativo/parlamentares/parlamentares.tokens';
import { PortalNotFoundError } from '../../domain/errors/portal.errors';
import { PublicParliamentarianViewModel } from '../view-models/public-parliamentarian.view-model';
import { ResolvePortalTenantUseCase } from './resolve-portal-tenant.use-case';

@Injectable()
export class GetPublicPortalParliamentarianUseCase {
    constructor(
        private readonly resolvePortalTenant: ResolvePortalTenantUseCase,
        @Inject(PARLIAMENTARIAN_REPOSITORY)
        private readonly parliamentarianRepository: ParliamentarianRepository,
    ) {}

    async execute(slug: string, parliamentarianId: string) {
        const record = await this.resolvePortalTenant.execute(slug);
        if (!record.portal.secoes.vereadores) {
            throw new PortalNotFoundError();
        }

        const profile = await this.parliamentarianRepository.findProfileById(
            record.tenantId,
            parliamentarianId,
        );
        if (!profile || profile.status !== ParliamentarianStatus.ACTIVE) {
            throw new ParliamentarianNotFoundError();
        }

        const http = ParliamentarianProfileViewModel.toHttp(
            profile as Parameters<typeof ParliamentarianProfileViewModel.toHttp>[0],
        );
        return PublicParliamentarianViewModel.toDetail(http);
    }
}
