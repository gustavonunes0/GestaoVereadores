import { Inject, Injectable } from '@nestjs/common';
import { TENANT_USER_REPOSITORY } from '../../../../identidade/tenant-users/tenant-users.tokens';
import { TenantUserRepository } from '../../../../identidade/tenant-users/domain/repositories/tenant-user.repository';
import { POLITICAL_PARTY_REPOSITORY } from '../../../partidos-politicos/partidos-politicos.tokens';
import { PoliticalPartyRepository } from '../../../partidos-politicos/domain/repositories/political-party.repository';
import { ParliamentarianRepository } from '../../domain/repositories/parliamentarian.repository';
import { ParliamentarianDomainService } from '../../domain/services/parliamentarian-domain.service';
import { PARLIAMENTARIAN_REPOSITORY } from '../../parlamentares.tokens';
import { CreateParliamentarianDto } from '../dto/create-parliamentarian.dto';
import {
    ParliamentarianAlreadyExistsError,
    PoliticalPartyNotFoundForParliamentarianError,
    PoliticalPartyRemovedForParliamentarianError,
    TenantUserNotFoundForParliamentarianError,
    TenantUserNotParliamentarianError,
} from '../errors/parliamentarian.errors';
import { ParliamentarianViewModel } from '../view-models/parliamentarian.view-model';

@Injectable()
export class CreateParliamentarianUseCase {
    private readonly domainService = new ParliamentarianDomainService();

    constructor(
        @Inject(PARLIAMENTARIAN_REPOSITORY)
        private readonly parliamentarianRepository: ParliamentarianRepository,
        @Inject(TENANT_USER_REPOSITORY)
        private readonly tenantUserRepository: TenantUserRepository,
        @Inject(POLITICAL_PARTY_REPOSITORY)
        private readonly politicalPartyRepository: PoliticalPartyRepository,
    ) {}

    async execute(tenantId: string, dto: CreateParliamentarianDto) {
        this.domainService.assertTenantUserIdProvided(dto.tenantUserId);

        const tenantUser = await this.tenantUserRepository.findByIdForTenant(
            tenantId,
            dto.tenantUserId,
        );
        if (!tenantUser) throw new TenantUserNotFoundForParliamentarianError();

        const duplicate =
            await this.parliamentarianRepository.existsByTenantUserId(
                tenantId,
                dto.tenantUserId,
            );

        try {
            this.domainService.assertTenantUserIsParliamentarian(tenantUser);
        } catch {
            throw new TenantUserNotParliamentarianError();
        }

        try {
            this.domainService.assertNoDuplicate(duplicate);
        } catch {
            throw new ParliamentarianAlreadyExistsError();
        }

        if (dto.politicalPartyId) {
            await this.assertPoliticalPartyForParliamentarian(
                tenantId,
                dto.politicalPartyId,
            );
        }

        const payload = {
            tenantId,
            tenantUserId: dto.tenantUserId,
            politicalPartyId: dto.politicalPartyId ?? null,
            parliamentaryName: dto.parliamentaryName,
            officeNumber: dto.officeNumber ?? null,
            photoUrl: dto.photoUrl ?? null,
            biography: dto.biography ?? null,
        };

        const removed =
            await this.parliamentarianRepository.findRemovedByTenantUserId(
                tenantId,
                dto.tenantUserId,
            );

        const saved = removed
            ? await this.parliamentarianRepository.reactivate(
                  tenantId,
                  removed.entity.id,
                  payload,
              )
            : await this.parliamentarianRepository.create(payload);

        return ParliamentarianViewModel.toHttp(saved);
    }

    private async assertPoliticalPartyForParliamentarian(
        tenantId: string,
        politicalPartyId: string,
    ) {
        const party = await this.politicalPartyRepository.findAnyById(
            tenantId,
            politicalPartyId,
        );
        try {
            this.domainService.assertPoliticalPartyUsable(party, tenantId);
        } catch (error) {
            if (
                error instanceof Error &&
                error.message.includes('removido')
            ) {
                throw new PoliticalPartyRemovedForParliamentarianError();
            }
            throw new PoliticalPartyNotFoundForParliamentarianError();
        }
    }
}
